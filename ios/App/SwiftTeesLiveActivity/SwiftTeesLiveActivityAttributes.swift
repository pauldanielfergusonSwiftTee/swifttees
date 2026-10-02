//
//  SwiftTeesLiveActivityAttributes.swift
//  App
//
//  Created by Paul Ferguson on 02/10/2026.
//

import ActivityKit
import Foundation

struct SwiftTeesLiveActivityAttributes: ActivityAttributes {

    public struct ContentState: Codable, Hashable {
        var leaderName: String
        var leaderPoints: Int
        var secondName: String
        var secondPoints: Int
        var thirdName: String
        var thirdPoints: Int
        var progress: String
        var status: String
    }

    var tournamentName: String
    var roundName: String
}
