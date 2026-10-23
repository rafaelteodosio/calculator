import type { BinaryOperation } from '../../api/contract';
import type { KeyId } from '../../calculator/types';
import { KEYPAD } from '../../calculator/keys';
import { Key } from '../Key/Key';
import styles from './Keypad.module.css';
interface Props {
  onPress(id: KeyId): void;
  disabled: boolean;
  activeOperation: BinaryOperation | null;
}
export function Keypad({ onPress, disabled, activeOperation }: Props) {
  return (
    <div className={styles.keypad} role="group" aria-label="Keypad">
      {KEYPAD.map((def) => (
        <Key
          key={def.id}
          def={def}
          onPress={onPress}
          disabled={disabled && def.kind !== 'clear'}
          pressed={activeOperation === def.id}
        />
      ))}
    </div>
  );
}
