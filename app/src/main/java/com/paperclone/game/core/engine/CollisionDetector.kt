package com.paperclone.game.core.engine

import kotlin.math.hypot

sealed class KillReason {
    data object OutOfBounds : KillReason()
    data object SelfTrail : KillReason()
    data class TrailHit(val killerId: Int) : KillReason()
    data class HeadToHead(val killerId: Int?) : KillReason()
}

data class DeathEvent(
    val victimId: Int,
    val killerId: Int?, // null if suicide / out of bounds
    val reason: KillReason
)

class CollisionDetector(val mapSize: Int = GameConfig.GRID_SIZE) {

    /**
     * Checks all collisions for the given players against map bounds,
     * trails, and other players' heads.
     * Returns list of DeathEvents occurring in this tick.
     */
    fun checkCollisions(
        players: List<Player>,
        gridMap: GridMap
    ): List<DeathEvent> {
        val deaths = ArrayList<DeathEvent>()
        val markedDead = HashSet<Int>()

        // 1. Check out of bounds & self-trail collisions
        for (player in players) {
            if (!player.isAlive || markedDead.contains(player.id)) continue

            // Out of bounds check
            if (player.x < 0f || player.x >= mapSize || player.y < 0f || player.y >= mapSize) {
                markedDead.add(player.id)
                deaths.add(DeathEvent(victimId = player.id, killerId = null, reason = KillReason.OutOfBounds))
                continue
            }

            // Self-trail collision only applies when outside own territory
            val insideOwn = gridMap.getOwnerAt(player.x, player.y) == player.id
            if (!insideOwn && player.trail.collidesWith(player.x, player.y, GameConfig.HEAD_RADIUS, ignoreLastSegments = 6)) {
                markedDead.add(player.id)
                deaths.add(DeathEvent(victimId = player.id, killerId = null, reason = KillReason.SelfTrail))
            }
        }

        // 2. Check head-to-other-trail collisions
        // If Player A's head hits Player B's trail -> Player B dies! Player A gets the kill.
        for (attacker in players) {
            if (!attacker.isAlive || markedDead.contains(attacker.id)) continue

            for (victim in players) {
                if (victim.id == attacker.id || !victim.isAlive || markedDead.contains(victim.id)) continue

                if (victim.trail.collidesWith(attacker.x, attacker.y, GameConfig.HEAD_RADIUS, ignoreLastSegments = 0)) {
                    markedDead.add(victim.id)
                    deaths.add(DeathEvent(victimId = victim.id, killerId = attacker.id, reason = KillReason.TrailHit(attacker.id)))
                }
            }
        }

        // 3. Check head-to-head collisions
        val headCollisionDist = GameConfig.HEAD_RADIUS * 2.0f
        for (i in players.indices) {
            val p1 = players[i]
            if (!p1.isAlive || markedDead.contains(p1.id)) continue

            for (j in (i + 1) until players.size) {
                val p2 = players[j]
                if (!p2.isAlive || markedDead.contains(p2.id)) continue

                val dist = hypot(p1.x - p2.x, p1.y - p2.y)
                if (dist <= headCollisionDist) {
                    val p1Inside = gridMap.getOwnerAt(p1.x, p1.y) == p1.id
                    val p2Inside = gridMap.getOwnerAt(p2.x, p2.y) == p2.id

                    when {
                        // Both outside territory: both die
                        !p1Inside && !p2Inside -> {
                            markedDead.add(p1.id)
                            markedDead.add(p2.id)
                            deaths.add(DeathEvent(victimId = p1.id, killerId = p2.id, reason = KillReason.HeadToHead(p2.id)))
                            deaths.add(DeathEvent(victimId = p2.id, killerId = p1.id, reason = KillReason.HeadToHead(p1.id)))
                        }
                        // P1 outside, P2 inside: P1 dies
                        !p1Inside && p2Inside -> {
                            markedDead.add(p1.id)
                            deaths.add(DeathEvent(victimId = p1.id, killerId = p2.id, reason = KillReason.HeadToHead(p2.id)))
                        }
                        // P2 outside, P1 inside: P2 dies
                        p1Inside && !p2Inside -> {
                            markedDead.add(p2.id)
                            deaths.add(DeathEvent(victimId = p2.id, killerId = p1.id, reason = KillReason.HeadToHead(p1.id)))
                        }
                        // Both inside: neither dies
                    }
                }
            }
        }

        return deaths
    }
}

