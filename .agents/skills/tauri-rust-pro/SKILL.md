---
name: tauri-rust-pro
description: Expert skill for developing cross-platform apps using Tauri v2, React, TypeScript, and Rust. Use this whenever generating React components, setting up custom hooks for IPC commands, managing UI state, or organizing backend crates.
---

# Tauri v2 + React Development Protocol

You are an elite full-stack systems architect specialized in React, TypeScript, and idiomatic Rust. When this skill is active, you must strictly adhere to the structural constraints, safety guidelines, and optimization patterns defined below.

## 1. Project Layout & Architecture
- Keep frontend React code cleanly separated within the designated UI directory (/src).
- Keep the backend core within /src-tauri.
- For modular features, use workspace crates within /src-tauri/crates/ rather than dumping all logic into a single monolithic main.rs or lib.rs.

## 2. React Components & Custom Hooks Strategy
- Type Safety: Explicitly type all React component props and state variables. Avoid any under all circumstances.
- Asynchronous Data Fetching: Encapsulate all Tauri command invocations (invoke) inside custom React hooks or async state effects. 
- Loading & Error UI States: Every UI component requesting data from the Rust backend must gracefully handle loading placeholders and serializable error states to prevent UI freezing.
- IPC Invocations: Use standard imports from @tauri-apps/api/core for invoking commands.

### Correct React + TypeScript Setup
import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface LeasePayload {
  id: string;
  tenantName: string;
  monthlyRent: number;
}

export const useLeaseData = (leaseId: string) => {
  const [data, setData] = useState<LeasePayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    invoke<LeasePayload>('fetch_lease_data', { id: leaseId })
      .then((res) => {
        setData(res);
        setError(null);
      })
      .catch((err: string) => {
        setError(err);
      })
      .finally(() => setLoading(false));
  }, [leaseId]);

  return { data, loading, error };
};

## 3. Secure IPC Command Patterns
Every Tauri command invoked from the React frontend must implement proper error boundaries, thread-safe state handling, and explicit payload mapping.
- Errors: Never expose raw Rust panics or internal system strings to the frontend. Always map errors to serializable strings or dedicated error enums using thiserror or serde::Serialize.
- State: Access application state via tauri::State<'_, T>. Ensure all shared types implement Send + Sync and are properly initialized in the builder sequence.
- Async Execution: Commands performing I/O or heavy computation must be asynchronous (async fn) to avoid blocking the main OS thread window event loop.

### Correct Rust Backend Command
#[tauri::command]
pub async fn fetch_lease_data(
    id: String,
    state: tauri::State<'_, AppState>,
) -> Result<LeasePayload, String> {
    state.db
        .get_lease(&id)
        .await
        .map_err(|e| format!("Failed to retrieve lease data: {e}"))
}

## 4. Idiomatic Rust & Memory Boundaries
- Avoid unbuffered file I/O operations inside high-frequency loops.
- Do not utilize unwrap() or expect() in production code. Prefer explicit error propagation (?) or clean fallback handling.
- When cloning types to satisfy lifetimes inside async blocks or multi-threaded scopes, explicitly clone variables prior to the block (let data_clone = data.clone();) to maintain ownership clarity.

## 5. Workflow Strategy
1. Analyze: Inspect the src-tauri/capabilities/ or tauri.conf.json rules before modifying exposed system APIs to ensure security permissions match.
2. Build Check: Before declaring a feature complete, execute a diagnostic check using cargo check or npm run tauri info via terminal execution tools to guarantee compiler compatibility.
3. Frontend Integration: When altering a Rust command signature, immediately update the corresponding TypeScript type definition or invocation handler on the frontend to ensure IPC matching.
