//
//  SwiftTeesLiveActivityManager.swift
//  App
//
//  Created by Paul Ferguson on 03/10/2026.
//

import Foundation
import ActivityKit

final class SwiftTeesLiveActivityManager {

    static let shared = SwiftTeesLiveActivityManager()

    private init() {}
    @available(iOS 16.2, *)
    func startTestActivity() {

        guard ActivityAuthorizationInfo().areActivitiesEnabled else {
            print("LIVE ACTIVITY: Live Activities are disabled")
            return
        }

        let attributes = SwiftTeesLiveActivityAttributes(
            tournamentName: "Worsley Park",
            roundName: "Day 2 · Individual"
        )

        let state = SwiftTeesLiveActivityAttributes.ContentState(
            leaderName: "Paul",
            leaderPoints: 32,
            secondName: "Ian",
            secondPoints: 30,
            thirdName: "Carl",
            thirdPoints: 29,
            progress: "Through 9",
            status: "LIVE"
        )

        let content = ActivityContent(
            state: state,
            staleDate: nil
        )

        do {
            let activity = try Activity.request(
                attributes: attributes,
                content: content,
                pushType: nil
            )

            print("LIVE ACTIVITY STARTED: \(activity.id)")

        } catch {
            print("LIVE ACTIVITY ERROR: \(error.localizedDescription)")
        }
    }
}
