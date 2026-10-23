import { displaySize } from '../../calculator/selectors';
import styles from './Display.module.css';
interface Props {
  value: string;
  error: string | null;
  expression: string;
}
export function Display({ value, error, expression }: Props) {
  const text = error ?? value;
  return (
    <div className={styles.display}>
      <div className={styles.expression} data-testid="expression" aria-hidden="true">
        {expression || ' '}
      </div>
      <div
        className={styles.value}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        data-size={displaySize(text)}
        data-error={error !== null ? 'true' : undefined}
      >
        {text}
      </div>
    </div>
  );
}
