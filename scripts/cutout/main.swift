// Subject cutout via Apple Vision (macOS 14+). Free, local, no API key.
// Usage: cutout <input.jpg> <output.png> [--all]
//   default: keeps the largest foreground instance (the appliance) — neighbours are dropped.
//   --all:   keeps every foreground instance (for side-by-side pairs).
import Foundation
import Vision
import CoreImage
import AppKit

let args = CommandLine.arguments
guard args.count >= 3 else { fputs("usage: cutout in out [--all]\n", stderr); exit(2) }
let inURL = URL(fileURLWithPath: args[1])
let outURL = URL(fileURLWithPath: args[2])
let keepAll = args.contains("--all")

guard let ci = CIImage(contentsOf: inURL, options: [.applyOrientationProperty: true]) else {
  fputs("cannot read \(args[1])\n", stderr); exit(1)
}
let handler = VNImageRequestHandler(ciImage: ci, options: [:])
let req = VNGenerateForegroundInstanceMaskRequest()
try handler.perform([req])
guard let obs = req.results?.first else { fputs("no foreground found\n", stderr); exit(3) }

var instances = obs.allInstances
if !keepAll && instances.count > 1 {
  // Pick the instance with the largest mask area.
  var best = instances.first!; var bestArea = 0
  for i in instances {
    let m = try obs.generateScaledMaskForImage(forInstances: IndexSet(integer: i), from: handler)
    CVPixelBufferLockBaseAddress(m, .readOnly)
    let w = CVPixelBufferGetWidth(m), h = CVPixelBufferGetHeight(m), bpr = CVPixelBufferGetBytesPerRow(m)
    let p = CVPixelBufferGetBaseAddress(m)!.assumingMemoryBound(to: Float32.self)
    var area = 0
    for y in stride(from: 0, to: h, by: 4) { for x in stride(from: 0, to: w, by: 4) { if p[y*(bpr/4)+x] > 0.5 { area += 1 } } }
    CVPixelBufferUnlockBaseAddress(m, .readOnly)
    if area > bestArea { bestArea = area; best = i }
  }
  instances = IndexSet(integer: best)
}

let masked = try obs.generateMaskedImage(ofInstances: instances, from: handler, croppedToInstancesExtent: false)
let outCI = CIImage(cvPixelBuffer: masked)
let ctx = CIContext()
guard let cg = ctx.createCGImage(outCI, from: outCI.extent) else { fputs("render failed\n", stderr); exit(4) }
let rep = NSBitmapImageRep(cgImage: cg)
guard let png = rep.representation(using: .png, properties: [:]) else { exit(5) }
try png.write(to: outURL)
print("ok \(cg.width)x\(cg.height) instances=\(obs.allInstances.count) kept=\(instances.count)")
