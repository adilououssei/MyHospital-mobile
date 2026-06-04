import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StarRatingProps {
  note: number;
  nombreAvis?: number;
  size?: number;
  color?: string;
  showValue?: boolean;
  showAvisCount?: boolean;
}

const StarRating = ({
  note,
  nombreAvis,
  size = 12,
  color = '#FFC107',
  showValue = true,
  showAvisCount = false,
}: StarRatingProps) => {
  const roundedNote = Math.round(note);

  return (
    <View style={styles.container}>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map(i => (
          <Ionicons
            key={i}
            name={i <= roundedNote ? 'star' : 'star-outline'}
            size={size}
            color={color}
          />
        ))}
      </View>
      {showValue && (
        <Text style={[styles.value, { fontSize: size }]}>
          {note.toFixed(1)}
        </Text>
      )}
      {showAvisCount && nombreAvis !== undefined && (
        <Text style={[styles.count, { fontSize: size - 2 }]}>
          ({nombreAvis} avis)
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  value: {
    fontWeight: '700',
    color: '#555',
    marginLeft: 2,
  },
  count: {
    color: '#888',
    fontWeight: '500',
  },
});

export default StarRating;
