import { create } from 'zustand';

export const useStore = create((set) => ({
  user: null, // Holds the Firebase Auth user
  userProfile: null, // Holds the Firestore user document (balance, levels)
  activeEvents: [],
  myBets: [],
  setUser: (user) => set({ user }),
  setUserProfile: (profile) => set({ userProfile: profile }),
  setActiveEvents: (events) => set({ activeEvents: events }),
  setMyBets: (bets) => set({ myBets: bets }),
}));
