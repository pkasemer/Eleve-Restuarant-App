import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { View } from 'react-native';

import { useTheme } from '../theme';
import { Card } from './Card';
import { Glyph } from './Glyph';
import { Pressy } from './Pressy';
import { Text } from './Text';

export type ListRowProps = {
  title: string;
  subtitle?: string;
  /** Anything small on the left: a monogram, badge or glyph. */
  leading?: ReactNode;
  /** Anything on the right: usually <Money/> or a <Badge/>. */
  trailing?: ReactNode;
  /** Optional content under the text, e.g. a proportion bar. */
  footer?: ReactNode;
  chevron?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  accessibilityHint?: string;
  /** Set by <ListGroup/>. */
  divider?: boolean;
};

/** A "ledger row": generous, scannable, hairline-separated. */
export function ListRow({
  title,
  subtitle,
  leading,
  trailing,
  footer,
  chevron,
  onPress,
  onLongPress,
  accessibilityHint,
  divider,
}: ListRowProps) {
  const { colors, space, hit, hairline } = useTheme();
  const interactive = !!(onPress || onLongPress);

  const body = (
    <View style={{ minHeight: hit.pos, paddingHorizontal: space[5], paddingVertical: space[4], justifyContent: 'center' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[4] }}>
        {leading}
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="bodyStrong" numberOfLines={2}>
            {title}
          </Text>
          {subtitle ? (
            <Text variant="callout" tone="secondary" numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {trailing ? <View style={{ alignItems: 'flex-end', gap: space[2] }}>{trailing}</View> : null}
        {chevron ? <Glyph name="chevron-right" size={18} color={colors.textTertiary} /> : null}
      </View>
      {footer ? <View style={{ marginTop: space[3] }}>{footer}</View> : null}
    </View>
  );

  return (
    <View style={divider ? { borderBottomWidth: hairline, borderBottomColor: colors.border } : undefined}>
      {interactive ? (
        <Pressy
          scale={false}
          accessibilityRole="button"
          accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
          accessibilityHint={accessibilityHint}
          onPress={onPress}
          onLongPress={onLongPress}>
          {body}
        </Pressy>
      ) : (
        body
      )}
    </View>
  );
}

/** Card that stacks ListRows and draws dividers between them automatically. */
export function ListGroup({ children }: { children: ReactNode }) {
  const rows = Children.toArray(children).filter(isValidElement) as ReactElement<ListRowProps>[];
  return (
    <Card padding="none">
      {rows.map((row, i) => cloneElement(row, { divider: i < rows.length - 1 }))}
    </Card>
  );
}

/** Small tinted letter badge for leading slots. */
export function Monogram({ label, bg, fg, size = 40 }: { label: string; bg: string; fg: string; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 3,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text variant="headline" style={{ color: fg }}>
        {label.trim().charAt(0).toUpperCase() || '•'}
      </Text>
    </View>
  );
}
