import { useCallback, useReducer, useRef } from 'react';
import { calculate } from '../api/client';
import { toDisplayMessage } from '../api/errorMessages';
import { calculatorReducer, getComputeRequest, initialState, keyToAction } from './reducer';
import type { CalcAction, KeyId } from './types';

export function useCalculator() {
  const [state, dispatch] = useReducer(calculatorReducer, initialState);
  const stateRef = useRef(initialState); // latest state, updated synchronously by apply()
  const busyRef = useRef(false); // synchronous guard against double-clicks within one tick
  const lastIdRef = useRef(0); // latest issued request id; anything else is stale

  const apply = useCallback((action: CalcAction) => {
    stateRef.current = calculatorReducer(stateRef.current, action);
    dispatch(action);
  }, []);

  const press = useCallback(
    (key: KeyId) => {
      if (key === 'clear') {
        busyRef.current = false;
        lastIdRef.current += 1; // invalidates any in-flight request
        apply({ type: 'clear' });
        return;
      }
      if (busyRef.current) return;
      const request = getComputeRequest(stateRef.current, key);
      if (!request) {
        const action = keyToAction(key);
        if (action) apply(action);
        return;
      }
      const requestId = ++lastIdRef.current;
      busyRef.current = true;
      apply({ type: 'computeStart', requestId, continuation: request.continuation });
      calculate(request.operation, request.operands).then(
        (result) => {
          if (requestId !== lastIdRef.current) return;
          busyRef.current = false;
          apply({ type: 'computeSuccess', requestId, result });
        },
        (error: unknown) => {
          if (requestId !== lastIdRef.current) return;
          busyRef.current = false;
          apply({ type: 'computeFailure', requestId, message: toDisplayMessage(error) });
        },
      );
    },
    [apply],
  );

  return { state, press };
}
