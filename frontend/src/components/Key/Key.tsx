import type { KeyDef } from '../../calculator/keys';
import type { KeyId } from '../../calculator/types';
import styles from './Key.module.css';
interface Props {
  def: KeyDef;
  onPress(id: KeyId): void;
  disabled: boolean;
  pressed?: boolean;
}
export function Key({ def, onPress, disabled, pressed }: Props) {
  const kind =
    def.kind === 'digit' || def.kind === 'decimal'
      ? 'digit'
      : def.kind === 'clear' || def.kind === 'unary'
        ? 'function'
        : def.kind;
  return (
    <button
      className={`${styles.key} ${styles[kind]}`}
      type="button"
      aria-label={def.ariaLabel}
      disabled={disabled}
      data-kind={def.kind}
      aria-pressed={def.kind === 'operator' ? pressed : undefined}
      onClick={() => onPress(def.id)}
    >
      {def.label}
    </button>
  );
}
