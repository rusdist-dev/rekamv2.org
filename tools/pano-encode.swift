/* Encode a web-ready equirectangular clip from a large 360° source.
 *
 *   swiftc -O tools/pano-encode.swift -o /tmp/pano-encode
 *   /tmp/pano-encode <source> <output.mp4> <startSec> <durationSec> <width> <kbps> [flags]
 *
 * avconvert can trim and scale but not set a bitrate, and its 1920 preset lands
 * around 10 Mbps — far more than a looping hero needs. This goes through
 * AVAssetReader/Writer so the bitrate, frame rate, keyframe spacing and codec
 * are all explicit. H.264 is the default because it is the only codec every
 * browser decodes from MP4; --codec=hevc is for the smaller sibling file that
 * capable browsers pick first, with the H.264 one left as the fallback source.
 *
 * Output is a plain 2:1 frame with no spherical metadata: the page maps it onto
 * a sphere itself, so anything that made a player "helpfully" reproject it
 * would be actively unwanted.
 */

import Foundation
import AVFoundation

let all = CommandLine.arguments
let positional = all.dropFirst().filter { !$0.hasPrefix("--") }
let flags: [String: String] = Dictionary(uniqueKeysWithValues:
    all.filter { $0.hasPrefix("--") }.map { arg -> (String, String) in
        let body = String(arg.dropFirst(2))
        let parts = body.split(separator: "=", maxSplits: 1).map(String.init)
        return (parts[0], parts.count > 1 ? parts[1] : "1")
    })

guard positional.count == 6 else {
    let usage = """
        usage: pano-encode <src> <out.mp4> <start> <duration> <width> <kbps> [flags]

          --height=N   force the output height instead of preserving the source
                       aspect. Use when a complete panorama was resized
                       non-uniformly: pass width/2 to restore the 2:1 grid.
          --fps=N      output frame rate (default: the source's). A slow ambient
                       loop reads fine well below 24, and every frame removed is
                       bitrate handed to the frames that remain.
          --gop=SEC    seconds between keyframes (default 2). A hero loop is
                       never seeked, so frequent keyframes buy nothing and cost
                       a lot — they are several times the size of a P-frame.
          --codec=X    h264 (default) or hevc. HEVC is roughly 40% smaller at
                       equal quality but needs an h264 sibling as a fallback
                       source for browsers that cannot decode it in MP4.

        """
    FileHandle.standardError.write(usage.data(using: .utf8)!)
    exit(2)
}

let srcURL = URL(fileURLWithPath: positional[0])
let outURL = URL(fileURLWithPath: positional[1])
let start = Double(positional[2])!
let duration = Double(positional[3])!
let outWidth = Int(positional[4])!
let kbps = Int(positional[5])!
let useHEVC = (flags["codec"] ?? "h264").lowercased() == "hevc"
let gopSeconds = Double(flags["gop"] ?? "2")!
let forcedHeight = flags["height"].flatMap { Int($0) }

let asset = AVURLAsset(url: srcURL)
guard let videoTrack = asset.tracks(withMediaType: .video).first else {
    FileHandle.standardError.write("no video track\n".data(using: .utf8)!)
    exit(1)
}

let natural = videoTrack.naturalSize
let sourceFps = videoTrack.nominalFrameRate > 0 ? videoTrack.nominalFrameRate : 30
let fps = flags["fps"].flatMap { Float($0) } ?? sourceFps

/* ---- letterbox detection ----------------------------------------------------
 * 360° footage is often delivered as a 2:1 panorama pillar-boxed inside a 16:9
 * container, because 16:9 is what most delivery pipelines assume. Those black
 * bars are not part of the panorama: mapped onto the sphere they become opaque
 * bands across the sky and the seabed. Find them and cut them out, so the frame
 * that reaches the texture is the panorama alone.
 */
func detectBars(at seconds: Double) -> (top: Int, bottom: Int) {
    let gen = AVAssetImageGenerator(asset: asset)
    gen.appliesPreferredTrackTransform = true
    gen.requestedTimeToleranceBefore = .zero
    gen.requestedTimeToleranceAfter = .zero
    guard let cg = try? gen.copyCGImage(at: CMTime(seconds: seconds, preferredTimescale: 600),
                                        actualTime: nil) else { return (0, 0) }
    let w = cg.width, h = cg.height
    var buf = [UInt8](repeating: 0, count: w * h * 4)
    guard let ctx = CGContext(data: &buf, width: w, height: h, bitsPerComponent: 8,
                              bytesPerRow: w * 4, space: CGColorSpaceCreateDeviceRGB(),
                              bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)
    else { return (0, 0) }
    ctx.draw(cg, in: CGRect(x: 0, y: 0, width: w, height: h))

    // Row 0 of a CGBitmapContext buffer is the TOP row.
    func rowMax(_ y: Int) -> Int {
        var m = 0
        for x in stride(from: 0, to: w, by: 3) {
            let i = (y * w + x) * 4
            m = max(m, Int(buf[i]), Int(buf[i + 1]), Int(buf[i + 2]))
        }
        return m
    }
    // Compression leaves black slightly above zero, hence the threshold rather
    // than an equality test.
    let thresh = 16
    var top = 0
    while top < h && rowMax(top) <= thresh { top += 1 }
    var bottom = h - 1
    while bottom > top && rowMax(bottom) <= thresh { bottom -= 1 }
    // Scale from the sampled frame back to the track's own pixel space.
    let k = natural.height / CGFloat(h)
    return (Int((CGFloat(top) * k).rounded()), Int((CGFloat(h - 1 - bottom) * k).rounded()))
}

// Sample two frames and take the smaller crop of the two: a dark frame could
// otherwise read as bars all the way in.
let a = detectBars(at: start + min(1.0, duration / 4))
let b = detectBars(at: start + duration / 2)
let cropTop = min(a.top, b.top)
let cropBottom = min(a.bottom, b.bottom)

let contentHeight = natural.height - CGFloat(cropTop + cropBottom)
if cropTop + cropBottom > 0 {
    print("letterbox   top \(cropTop)px, bottom \(cropBottom)px -> content \(Int(natural.width))x\(Int(contentHeight))")
}

/* Preserve the content aspect by default — but allow it to be overridden.
 *
 * A panorama that has been exported to 16:9 without letterboxing has been
 * resized non-uniformly: the pixels are all still there and the frame still
 * wraps, only the sampling grid is wrong. Forcing the height puts it back on a
 * 2:1 grid, which is a lossless correction in the sense that matters — nothing
 * is cropped away, only resampled. Preserving the source aspect in that case is
 * exactly the wrong thing: it faithfully carries the distortion through.
 */
let naturalHeight = Int((Double(outWidth) * Double(contentHeight) / Double(natural.width)).rounded())
let outHeight = forcedHeight ?? naturalHeight
let outSize = CGSize(width: outWidth, height: outHeight)
let ratio = Double(outWidth) / Double(outHeight)

if let forced = forcedHeight, forced != naturalHeight {
    let srcRatio = Double(natural.width) / Double(contentHeight)
    print("aspect      source content \(String(format: "%.4f", srcRatio)):1 -> forced \(String(format: "%.4f", ratio)):1"
        + " (vertical scale \(String(format: "%.4f", Double(forced) / Double(naturalHeight))))")
}
if abs(ratio - 2.0) > 0.02 {
    print("WARNING     output is \(String(format: "%.3f", ratio)):1, not 2:1 — the sphere mapping will be stretched")
}

if fps != sourceFps { print("framerate   \(String(format: "%.0f", sourceFps))fps -> \(String(format: "%.0f", fps))fps") }
print("codec       \(useHEVC ? "HEVC" : "H.264"), keyframe every \(gopSeconds)s")
print("source \(Int(natural.width))x\(Int(natural.height)) @\(Int(sourceFps))fps -> \(outWidth)x\(outHeight) @\(String(format: "%.0f", fps))fps @\(kbps)kbps, \(duration)s from \(start)s")

let range = CMTimeRange(
    start: CMTime(seconds: start, preferredTimescale: 600),
    duration: CMTime(seconds: duration, preferredTimescale: 600)
)

// ---- reader ----------------------------------------------------------------

let reader = try AVAssetReader(asset: asset)
reader.timeRange = range

// A video composition does the scaling for us.
let composition = AVMutableVideoComposition()
composition.renderSize = outSize
composition.frameDuration = CMTime(value: 1, timescale: CMTimeScale(fps.rounded()))

let instruction = AVMutableVideoCompositionInstruction()
instruction.timeRange = CMTimeRange(start: .zero, duration: asset.duration)
let layer = AVMutableVideoCompositionLayerInstruction(assetTrack: videoTrack)
// Slide the frame up so the first content row lands on output row 0, then scale
// each axis to the output. The two scales differ only when the aspect is being
// corrected; otherwise this is a uniform scale.
let sx = outSize.width / natural.width
let sy = outSize.height / contentHeight
layer.setTransform(
    CGAffineTransform(translationX: 0, y: -CGFloat(cropTop))
        .concatenating(CGAffineTransform(scaleX: sx, y: sy)),
    at: .zero
)
instruction.layerInstructions = [layer]
composition.instructions = [instruction]

let videoOut = AVAssetReaderVideoCompositionOutput(
    videoTracks: [videoTrack],
    videoSettings: [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA]
)
videoOut.videoComposition = composition
videoOut.alwaysCopiesSampleData = false
reader.add(videoOut)

let audioTrack = asset.tracks(withMediaType: .audio).first
var audioOut: AVAssetReaderTrackOutput?
if let audioTrack {
    let out = AVAssetReaderTrackOutput(track: audioTrack, outputSettings: [
        AVFormatIDKey: kAudioFormatLinearPCM,
        AVLinearPCMBitDepthKey: 16,
        AVLinearPCMIsFloatKey: false,
        AVLinearPCMIsBigEndianKey: false,
        AVLinearPCMIsNonInterleaved: false,
    ])
    out.alwaysCopiesSampleData = false
    reader.add(out)
    audioOut = out
}

// ---- writer ----------------------------------------------------------------

try? FileManager.default.removeItem(at: outURL)
let writer = try AVAssetWriter(outputURL: outURL, fileType: .mp4)

let videoIn = AVAssetWriterInput(mediaType: .video, outputSettings: [
    AVVideoCodecKey: useHEVC ? AVVideoCodecType.hevc : AVVideoCodecType.h264,
    AVVideoWidthKey: outWidth,
    AVVideoHeightKey: outHeight,
    AVVideoCompressionPropertiesKey: [
        AVVideoAverageBitRateKey: kbps * 1000,
        AVVideoAllowFrameReorderingKey: true,
        AVVideoMaxKeyFrameIntervalKey: max(1, Int((Double(fps) * gopSeconds).rounded())),
        AVVideoMaxKeyFrameIntervalDurationKey: gopSeconds,
    ],
])
videoIn.expectsMediaDataInRealTime = false
writer.add(videoIn)

var audioIn: AVAssetWriterInput?
if audioTrack != nil {
    let input = AVAssetWriterInput(mediaType: .audio, outputSettings: [
        AVFormatIDKey: kAudioFormatMPEG4AAC,
        AVNumberOfChannelsKey: 2,
        AVSampleRateKey: 44100,
        AVEncoderBitRateKey: 96_000,
    ])
    input.expectsMediaDataInRealTime = false
    writer.add(input)
    audioIn = input
}

guard reader.startReading() else {
    FileHandle.standardError.write("reader failed: \(reader.error?.localizedDescription ?? "?")\n".data(using: .utf8)!)
    exit(1)
}
writer.startWriting()
// AVAssetReader hands back samples stamped on the asset timeline, not rebased
// to zero — so the session has to start at the trim point or the output carries
// `start` seconds of emptiness in front of the clip.
writer.startSession(atSourceTime: range.start)

let group = DispatchGroup()
var frames = 0

group.enter()
videoIn.requestMediaDataWhenReady(on: DispatchQueue(label: "video")) {
    while videoIn.isReadyForMoreMediaData {
        guard let sample = videoOut.copyNextSampleBuffer() else {
            videoIn.markAsFinished(); group.leave(); return
        }
        videoIn.append(sample)
        frames += 1
        if frames % 60 == 0 { print("  \(frames) frames", terminator: "\r"); fflush(stdout) }
    }
}

if let audioIn, let audioOut {
    group.enter()
    audioIn.requestMediaDataWhenReady(on: DispatchQueue(label: "audio")) {
        while audioIn.isReadyForMoreMediaData {
            guard let sample = audioOut.copyNextSampleBuffer() else {
                audioIn.markAsFinished(); group.leave(); return
            }
            audioIn.append(sample)
        }
    }
}

group.wait()

let done = DispatchSemaphore(value: 0)
writer.finishWriting { done.signal() }
done.wait()

if writer.status == .failed {
    FileHandle.standardError.write("writer failed: \(writer.error?.localizedDescription ?? "?")\n".data(using: .utf8)!)
    exit(1)
}

let bytes = (try? FileManager.default.attributesOfItem(atPath: outURL.path)[.size] as? Int) ?? 0
print("\nwrote \(outURL.lastPathComponent) — \(frames) frames, \((bytes ?? 0) / 1024 / 1024) MB")
