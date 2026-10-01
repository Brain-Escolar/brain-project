"use client";

import * as S from "./styles";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  /** Rótulo acessível do grupo (role="tablist"). */
  ariaLabel?: string;
  /** Ocupa a largura do container, dividindo-a igualmente entre as opções. */
  fullWidth?: boolean;
}

/**
 * Controle segmentado (pílula afundada com o item ativo elevado),
 * conforme o Design System Brain. Usado p.ex. no toggle Diário/Semanal.
 */
export default function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  fullWidth,
}: SegmentedControlProps<T>) {
  return (
    <S.Group role="tablist" aria-label={ariaLabel} $fullWidth={fullWidth}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <S.Segment
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            $active={active}
            $fullWidth={fullWidth}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </S.Segment>
        );
      })}
    </S.Group>
  );
}
