"use client";

import * as React from "react";

export function createSyncedStore<T>(storageKey: string, initialData: T) {
  let listeners: Array<() => void> = [];
  let currentData: T = initialData;
  let initialized = false;

  function initFromStorage() {
    if (typeof window !== "undefined" && !initialized) {
      initialized = true;
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          currentData = JSON.parse(saved);
        }
      } catch {
        // ignore storage errors
      }
    }
  }

  function getSnapshot(): T {
    initFromStorage();
    return currentData;
  }

  function getServerSnapshot(): T {
    return initialData;
  }

  function subscribe(listener: () => void) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }

  function setStore(updater: T | ((prev: T) => T)) {
    initFromStorage();
    if (typeof updater === "function") {
      currentData = (updater as (prev: T) => T)(currentData);
    } else {
      currentData = updater;
    }

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, JSON.stringify(currentData));
      } catch {
        // ignore
      }
    }

    listeners.forEach((listener) => listener());
  }

  function useStore(): [T, (updater: T | ((prev: T) => T)) => void] {
    const data = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    return [data, setStore];
  }

  return {
    useStore,
    setStore,
    getSnapshot,
  };
}
