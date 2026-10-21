import Foundation
import Vision

func faceCount(for path: String) -> Int {
    let request = VNDetectFaceRectanglesRequest()
    let handler = VNImageRequestHandler(url: URL(fileURLWithPath: path), options: [:])

    do {
        try handler.perform([request])
    } catch {
        return -1
    }

    return request.results?.count ?? 0
}

for path in CommandLine.arguments.dropFirst() {
    print("\(faceCount(for: path))\t\(path)")
}
