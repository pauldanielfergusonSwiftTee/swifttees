//
//  SwiftTeesLiveActivityLiveActivity.swift
//  SwiftTeesLiveActivity
//
//  Created by Paul Ferguson on 02/10/2026.
//

import ActivityKit
import WidgetKit
import SwiftUI

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

    // These stay the same for the lifetime of the activity
    var tournamentName: String
    var roundName: String
}

struct SwiftTeesLiveActivityLiveActivity: Widget {

    var body: some WidgetConfiguration {

        ActivityConfiguration(
            for: SwiftTeesLiveActivityAttributes.self
        ) { context in

            // MARK: - Lock Screen / Banner

            VStack(alignment: .leading, spacing: 10) {

                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("⛳ SWIFT TEES")
                            .font(.caption)
                            .fontWeight(.bold)

                        Text(context.attributes.tournamentName)
                            .font(.headline)
                    }

                    Spacer()

                    Text(context.state.status)
                        .font(.caption)
                        .fontWeight(.bold)
                }

                Divider()

                leaderboardRow(
                    position: "1",
                    name: context.state.leaderName,
                    points: context.state.leaderPoints,
                    leader: true
                )

                leaderboardRow(
                    position: "2",
                    name: context.state.secondName,
                    points: context.state.secondPoints
                )

                leaderboardRow(
                    position: "3",
                    name: context.state.thirdName,
                    points: context.state.thirdPoints
                )

                HStack {
                    Text(context.attributes.roundName)

                    Spacer()

                    Text(context.state.progress)
                        .fontWeight(.semibold)
                }
                .font(.caption)
                .foregroundStyle(.secondary)
            }
            .padding()
            .activityBackgroundTint(Color.black)
            .activitySystemActionForegroundColor(Color.white)

        } dynamicIsland: { context in

            DynamicIsland {

                // MARK: Expanded Dynamic Island

                DynamicIslandExpandedRegion(.leading) {
                    VStack(alignment: .leading) {
                        Text("⛳")
                        Text("Swift Tees")
                            .font(.caption2)
                            .fontWeight(.bold)
                    }
                }

                DynamicIslandExpandedRegion(.trailing) {
                    VStack(alignment: .trailing) {
                        Text("\(context.state.leaderPoints)")
                            .font(.title3)
                            .fontWeight(.bold)

                        Text("PTS")
                            .font(.caption2)
                    }
                }

                DynamicIslandExpandedRegion(.center) {
                    Text(context.attributes.tournamentName)
                        .font(.caption)
                        .fontWeight(.semibold)
                        .lineLimit(1)
                }

                DynamicIslandExpandedRegion(.bottom) {
                    VStack(spacing: 5) {

                        HStack {
                            Text("🏆 \(context.state.leaderName)")
                                .fontWeight(.bold)

                            Spacer()

                            Text("\(context.state.leaderPoints) pts")
                                .fontWeight(.bold)
                        }

                        HStack {
                            Text("2  \(context.state.secondName)")
                            Spacer()
                            Text("\(context.state.secondPoints) pts")
                        }

                        HStack {
                            Text("3  \(context.state.thirdName)")
                            Spacer()
                            Text("\(context.state.thirdPoints) pts")
                        }

                        HStack {
                            Text(context.state.status)

                            Spacer()

                            Text(context.state.progress)
                        }
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                    }
                    .font(.caption)
                }

            } compactLeading: {

                Text("⛳")

            } compactTrailing: {

                Text("\(context.state.leaderPoints)")
                    .fontWeight(.bold)

            } minimal: {

                Text("⛳")

            }
            .widgetURL(
                URL(string: "https://swifttees.co.uk/live-centre")
            )
        }
    }

    @ViewBuilder
    private func leaderboardRow(
        position: String,
        name: String,
        points: Int,
        leader: Bool = false
    ) -> some View {

        HStack {
            Text(leader ? "🏆" : position)
                .frame(width: 24, alignment: .leading)

            Text(name)
                .fontWeight(leader ? .bold : .regular)

            Spacer()

            Text("\(points) pts")
                .fontWeight(leader ? .bold : .semibold)
        }
        .font(.subheadline)
    }
}


// MARK: - Preview Data

extension SwiftTeesLiveActivityAttributes {

    fileprivate static var preview: SwiftTeesLiveActivityAttributes {

        SwiftTeesLiveActivityAttributes(
            tournamentName: "Worsley Park",
            roundName: "Day 2 · Individual"
        )
    }
}


extension SwiftTeesLiveActivityAttributes.ContentState {

    fileprivate static var live: SwiftTeesLiveActivityAttributes.ContentState {

        SwiftTeesLiveActivityAttributes.ContentState(
            leaderName: "Paul",
            leaderPoints: 32,
            secondName: "Ian",
            secondPoints: 30,
            thirdName: "Carl",
            thirdPoints: 29,
            progress: "Through 9",
            status: "LIVE"
        )
    }
}


#Preview(
    "Swift Tees Live",
    as: .content,
    using: SwiftTeesLiveActivityAttributes.preview
) {

    SwiftTeesLiveActivityLiveActivity()

} contentStates: {

    SwiftTeesLiveActivityAttributes.ContentState.live
}
