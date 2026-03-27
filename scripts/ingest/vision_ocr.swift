#!/usr/bin/env swift
import Foundation
import Vision
import AppKit
import PDFKit

func recognize(cgImage: CGImage) -> String {
    let request = VNRecognizeTextRequest()
    request.recognitionLevel = .accurate
    request.usesLanguageCorrection = true
    request.minimumTextHeight = 0.01
    let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
    do {
        try handler.perform([request])
    } catch {
        fputs("vision error: \(error)\n", stderr)
        return ""
    }
    let lines = (request.results ?? []).compactMap { obs in
        obs.topCandidates(1).first?.string
    }
    return lines.joined(separator: "\n")
}

func imageToCGImage(_ path: String) -> CGImage? {
    guard let nsImage = NSImage(contentsOfFile: path) else { return nil }
    var rect = NSRect(origin: .zero, size: nsImage.size)
    return nsImage.cgImage(forProposedRect: &rect, context: nil, hints: nil)
}

func pdfText(_ path: String, maxPages: Int?) -> String {
    guard let pdf = PDFDocument(url: URL(fileURLWithPath: path)) else { return "" }
    let count = maxPages.map { min($0, pdf.pageCount) } ?? pdf.pageCount
    var out: [String] = []
    for idx in 0..<count {
        guard let page = pdf.page(at: idx) else { continue }
        let bounds = page.bounds(for: .mediaBox)
        let scale: CGFloat = 2.0
        let width = Int(bounds.width * scale)
        let height = Int(bounds.height * scale)
        guard let colorSpace = CGColorSpace(name: CGColorSpace.sRGB),
              let ctx = CGContext(data: nil, width: width, height: height, bitsPerComponent: 8, bytesPerRow: 0, space: colorSpace, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)
        else { continue }
        ctx.setFillColor(NSColor.white.cgColor)
        ctx.fill(CGRect(x: 0, y: 0, width: CGFloat(width), height: CGFloat(height)))
        ctx.saveGState()
        ctx.translateBy(x: 0, y: CGFloat(height))
        ctx.scaleBy(x: scale, y: -scale)
        page.draw(with: .mediaBox, to: ctx)
        ctx.restoreGState()
        if let img = ctx.makeImage() {
            let text = recognize(cgImage: img)
            if !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                out.append("[Page \(idx+1)]\n" + text)
            }
        }
    }
    return out.joined(separator: "\n\n")
}

func main() {
    let args = CommandLine.arguments
    guard args.count >= 3 else {
        fputs("usage: vision_ocr.swift <image|pdf> <path> [maxPages]\n", stderr)
        exit(2)
    }
    let mode = args[1]
    let path = args[2]
    if mode == "image" {
        guard let cg = imageToCGImage(path) else {
            fputs("failed to load image\n", stderr)
            exit(1)
        }
        print(recognize(cgImage: cg))
    } else if mode == "pdf" {
        let maxPages = args.count >= 4 ? Int(args[3]) : nil
        print(pdfText(path, maxPages: maxPages))
    } else {
        fputs("unknown mode\n", stderr)
        exit(2)
    }
}

main()
