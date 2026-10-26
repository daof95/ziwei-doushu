'use client';
import { createContext, useContext, useState, type Dispatch, type SetStateAction } from 'react';
import type { ZiweiChart } from '@/lib/ziwei/types';
import { EMPTY_FORM, type InternationalBirthForm, type PreparedBirth } from '@/lib/i18n/birth';

interface InternationalState {
  form: InternationalBirthForm;
  setForm: Dispatch<SetStateAction<InternationalBirthForm>>;
  result: { chart: ZiweiChart; birth: PreparedBirth } | null;
  setResult: Dispatch<SetStateAction<{ chart: ZiweiChart; birth: PreparedBirth } | null>>;
}
const Context = createContext<InternationalState | null>(null);
/** Above locale segments: switching language keeps birth data in memory only. */
export function InternationalProvider({ children }: { children: React.ReactNode }) {
  const [form, setForm] = useState<InternationalBirthForm>({ ...EMPTY_FORM });
  const [result, setResult] = useState<InternationalState['result']>(null);
  return <Context.Provider value={{ form, setForm, result, setResult }}>{children}</Context.Provider>;
}
export function useInternationalState() {
  const state = useContext(Context);
  if (!state) throw new Error('InternationalProvider is required');
  return state;
}
