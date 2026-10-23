import { useCalculator } from '../../calculator/useCalculator';
import { selectExpression } from '../../calculator/selectors';
import { Display } from '../Display/Display';
import { Keypad } from '../Keypad/Keypad';
import styles from './Calculator.module.css';
export function Calculator() {
  const { state, press } = useCalculator();
  return (
    <section className={styles.calculator} aria-label="Calculator" aria-busy={state.loading}>
      <Display value={state.display} error={state.error} expression={selectExpression(state)} />
      <Keypad
        onPress={press}
        disabled={state.loading}
        activeOperation={state.awaitingOperand ? state.pendingOperation : null}
      />
    </section>
  );
}
