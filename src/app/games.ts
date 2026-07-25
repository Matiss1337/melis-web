import { lazy } from 'react'

export const MelisGame = lazy(() => import('../games/melis/MelisGame'))
export const TikTokGame = lazy(() => import('../games/tik-tok/TikTokGame'))
export const MemaisSovsGame = lazy(() => import('../games/memais-sovs/MemaisSovsGame'))
export const TwentyQuestionsGame = lazy(() => import('../games/20-jautajumi/TwentyQuestionsGame'))
export const CiparsVaiGerbonisGame = lazy(() => import('../games/cipars-vai-gerbonis/CiparsVaiGerbonisGame'))
