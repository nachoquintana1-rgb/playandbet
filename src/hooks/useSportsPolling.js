import { useEffect, useRef } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import axios from 'axios';
import { db } from '../services/firebase';

const API_SPORTS_KEY = "ddc6d8888ee0d4413d917f826786a3a5";
const LIVE_POLL_MS = 60 * 1000; // 60 seconds
const UPCOMING_POLL_MS = 5 * 60 * 1000; // 5 mins

const SPORTS = [
  { name: 'football', url: 'https://v3.football.api-sports.io/fixtures' },
  { name: 'basketball', url: 'https://v1.basketball.api-sports.io/games' },
  { name: 'tennis', url: 'https://v1.tennis.api-sports.io/fixtures' } // Adjust to match tennis endpoints occasionally using fixtures vs games
];

export function useSportsPolling() {
  const timerRef = useRef(null);

  useEffect(() => {
    if (!db) return;

    const attemptFetch = async () => {
      const statusRef = doc(db, 'system', 'polling_status');
      try {
        const snap = await getDoc(statusRef);
        const data = snap.exists() ? snap.data() : {};
        
        const now = new Date();
        const lastLive = data.last_live_fetch?.toDate() || new Date(0);
        const lastUp = data.last_upcoming_fetch?.toDate() || new Date(0);

        const shouldFetchLive = (now - lastLive) >= LIVE_POLL_MS;
        const shouldFetchUpcoming = (now - lastUp) >= UPCOMING_POLL_MS;

        if (!shouldFetchLive && !shouldFetchUpcoming) return;

        // Claim leadership lock
        await setDoc(statusRef, { 
          ...(shouldFetchLive && { last_live_fetch: serverTimestamp() }),
          ...(shouldFetchUpcoming && { last_upcoming_fetch: serverTimestamp() })
        }, { merge: true });

        // Execute API calls
        if (shouldFetchLive) await fetchMultipleSports(true);
        if (shouldFetchUpcoming) await fetchMultipleSports(false);

      } catch (err) {
        // Silently fail if lock collision occurs
      }
    };

    attemptFetch();
    timerRef.current = setInterval(attemptFetch, 20000); // Check every 20s if we need to run a 60s or 5m poll

    return () => clearInterval(timerRef.current);
  }, []);

  const fetchMultipleSports = async (isLive) => {
    const today = new Date().toISOString().split('T')[0];
    const params = isLive ? { live: 'all' } : { date: today };

    for (let sport of SPORTS) {
      try {
        const res = await axios.get(sport.url, {
          headers: { "x-apisports-key": API_SPORTS_KEY },
          params
        });

        const items = res.data?.response || [];
        
        // Batch writes to Firestore
        items.forEach(async (item) => {
          const id = item.fixture?.id || item.id;
          if (!id) return;
          
          let statusStr, homeName, awayName, homeLogo, awayLogo, homeScore, awayScore, startTime, competitionName;

          if (sport.name === 'football') {
             statusStr = item.fixture.status.short;
             homeName = item.teams.home.name;
             awayName = item.teams.away.name;
             homeLogo = item.teams.home.logo;
             awayLogo = item.teams.away.logo;
             homeScore = item.goals.home;
             awayScore = item.goals.away;
             startTime = item.fixture.date;
             competitionName = item.league.name;
          } else if (sport.name === 'basketball') {
             statusStr = item.status.short;
             homeName = item.teams.home.name;
             awayName = item.teams.away.name;
             homeLogo = item.teams.home.logo;
             awayLogo = item.teams.away.logo;
             homeScore = item.scores.home.total;
             awayScore = item.scores.away.total;
             startTime = item.date;
             competitionName = item.league.name;
          } else if (sport.name === 'tennis') {
             statusStr = item.fixture?.status?.short || item.status;
             homeName = item.teams?.home?.name || item.player1?.name || "Player 1";
             awayName = item.teams?.away?.name || item.player2?.name || "Player 2";
             homeLogo = item.teams?.home?.logo || null;
             awayLogo = item.teams?.away?.logo || null;
             homeScore = item.scores?.home || item.sets?.player1 || 0;
             awayScore = item.scores?.away || item.sets?.player2 || 0;
             startTime = item.fixture?.date || item.date;
             competitionName = item.league?.name || item.tournament?.name || "Tennis Match";
          }

          const isMatchFinished = ['FT', 'AET', 'PEN', 'AW', 'POST'].includes(statusStr);
          const isMatchLive = ['1H', '2H', 'HT', 'LIVE', 'Q1', 'Q2', 'Q3', 'Q4', 'S1', 'S2', 'S3'].includes(statusStr);

          const eventRef = doc(db, 'events', `\${sport.name}_\${id}`);
          await setDoc(eventRef, {
            apiId: id,
            sport: sport.name,
            status: statusStr,
            homeTeamName: homeName,
            awayTeamName: awayName,
            homeTeamLogo: homeLogo,
            awayTeamLogo: awayLogo,
            competitionName: competitionName,
            startTime: new Date(startTime).toISOString(),
            currentScore: { home: homeScore, away: awayScore },
            bettingLocked: isMatchLive || isMatchFinished,
            updatedAt: serverTimestamp()
          }, { merge: true });
        });
      } catch (err) {
        console.warn(`Failed fetching \${sport.name}:`, err.message);
      }
    }
  };
}
