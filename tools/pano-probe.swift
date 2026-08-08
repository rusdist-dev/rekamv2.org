/* Inspect a candidate 360° source before wiring it into the page.
 *
 *   swiftc -O tools/pano-probe.swift -o /tmp/pano-probe
 *   /tmp/pano-probe <source> [frameOutput.jpg] [atSeconds]
 *
 * Reports the things that decide whether a file can be used as an
 * equirectangular texture at all: the track's natural size and aspect (must be
 * 2:1), the codec, and any spherical-video metadata the container carries.
 * Optionally writes one frame so the projection can be eyeballed — a genuine
 * equirectangular frame has a strongly curved horizon and smeared poles.
 */

import Foundation
import AVFoundation
import CoreImage
import AppKit

let args = CommandLine.arguments
guard args.count >= 2 else {
    FileHandle.standardError.write("usage: pano-probe <src> [frame.jpg] [atSeconds]\n".data(using: .utf8)!)
    exit(2)
}

let url = URL(fileURLWithPath: args[1])
let asset = AVURLAsset(url: url)

guard let track = asset.tracks(withMediaType: .video).first else {
    FileHandle.standardError.write("no video track\n".data(using: .utf8)!)
    exit(1)
}

let natural = track.naturalSize
let transformed = natural.applying(track.preferredTransform)
let w = abs(transformed.width), h = abs(transformed.height)
let ratio = w / h

print("file        \(url.lastPathComponent)")
print("duration    \(String(format: "%.2f", CMTimeGetSeconds(asset.duration)))s")
print("natural     \(Int(natural.width))x\(Int(natural.height))")
print("displayed   \(Int(w))x\(Int(h))  aspect \(String(format: "%.4f", ratio)):1")
print("fps         \(String(format: "%.2f", track.nominalFrameRate))")
print("bitrate     \(String(format: "%.2f", track.estimatedDataRate / 1_000_000)) Mbps")

for desc in track.formatDescriptions {
    let d = desc as! CMFormatDescription
    let sub = CMFormatDescriptionGetMediaSubType(d)
    let tag = String(bytes: [
        UInt8((sub >> 24) & 0xFF), UInt8((sub >> 16) & 0xFF),
        UInt8((sub >> 8) & 0xFF), UInt8(sub & 0xFF),
    ], encoding: .ascii) ?? "?"
    print("codec       \(tag)")
}

// Spherical metadata, if the muxer wrote any. Its absence is not disqualifying
// — hero-360.js does the projection itself and ignores the tag — but its
// presence is good evidence the frame really is equirectangular.
var sawSpherical = false
for item in asset.metadata + track.metadata {
    let key = item.key?.description ?? item.identifier?.rawValue ?? "?"
    let value = item.stringValue ?? item.numberValue?.description ?? ""
    if key.lowercased().contains("spherical") || value.lowercased().contains("equirect") {
        sawSpherical = true
        print("spherical   \(key) = \(value)")
    }
}
if !sawSpherical { print("spherical   none found in container metadata") }

// The verdict that matters.
let off = abs(ratio - 2.0)
if off < 0.01 {
    print("VERDICT     2:1 — usable as equirectangular")
} else {
    print("VERDICT     NOT 2:1 (off by \(String(format: "%.3f", off))) — mapping this to a sphere would distort it")
}

// Optional frame dump.
if args.count >= 3 {
    let gen = AVAssetImageGenerator(asset: asset)
    gen.appliesPreferredTrackTransform = true
    gen.requestedTimeToleranceBefore = .zero
    gen.requestedTimeToleranceAfter = .zero
    let at = args.count >= 4 ? Double(args[3])! : 1.0
    do {
        let cg = try gen.copyCGImage(at: CMTime(seconds: at, preferredTimescale: 600), actualTime: nil)
        let rep = NSBitmapImageRep(cgImage: cg)
        if let data = rep.representation(using: .jpeg, properties: [.compressionFactor: 0.9]) {
            try data.write(to: URL(fileURLWithPath: args[2]))
            print("frame       wrote \(args[2]) at \(at)s (\(cg.width)x\(cg.height))")
        }
    } catch {
        print("frame       failed: \(error.localizedDescription)")
    }
}
