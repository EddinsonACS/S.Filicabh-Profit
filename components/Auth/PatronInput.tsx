import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, Text, View } from 'react-native';

interface PatronInputProps {
  onPatronComplete?: (pattern: number[]) => void;
}

interface Point {
  id: number;
  position: {
    row: number;
    col: number;
  };
}

interface LineCoordinates {
  start: { row: number; col: number } | null;
  end: { x: number; y: number } | null;
}

interface GridRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const PatronInput: React.FC<PatronInputProps> = ({ onPatronComplete = () => {} }) => {
  const [pattern, setPattern] = useState<number[]>([]);
  const [currentLine, setCurrentLine] = useState<LineCoordinates>({ start: null, end: null });
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isFirstPattern, setIsFirstPattern] = useState<boolean>(true);
  const [firstPattern, setFirstPattern] = useState<number[]>([]);
  const [isPatternSuccess, setIsPatternSuccess] = useState<boolean>(false);
  
  const gridRef = useRef<View>(null);
  const currentPoint = useRef<number | null>(null);
  const dotScale = useRef(new Animated.Value(1)).current;
  
  const router = useRouter();

  const points: Point[] = Array.from({ length: 9 }, (_, index) => ({
    id: index + 1,
    position: {
      row: Math.floor(index / 3),
      col: index % 3
    }
  }));

  const isAdjacent = (lastPoint: number | null, newPoint: number): boolean => {
    if (!lastPoint) return true;
    const lastPos = points[lastPoint - 1].position;
    const newPos = points[newPoint - 1].position;
    const rowDiff = Math.abs(lastPos.row - newPos.row);
    const colDiff = Math.abs(lastPos.col - newPos.col);
    return rowDiff <= 1 && colDiff <= 1;
  };

  const getNearestPoint = (x: number, y: number, rect: GridRect): number | null => {
    const pointSize = 40;
    const gridSize = rect.width;
    const spacing = gridSize / 3;
    const col = Math.floor((x - rect.x) / spacing);
    const row = Math.floor((y - rect.y) / spacing);
    
    if (col >= 0 && col < 3 && row >= 0 && row < 3) {
      const pointIndex = row * 3 + col;
      const pointCenterX = rect.x + (col + 0.5) * spacing;
      const pointCenterY = rect.y + (row + 0.5) * spacing;
      const distance = Math.hypot(x - pointCenterX, y - pointCenterY);
      
      return distance < pointSize / 2 ? pointIndex + 1 : null;
    }
    return null;
  };

  const animateDot = (): void => {
    Animated.sequence([
      Animated.spring(dotScale, {
        toValue: 1.5,
        friction: 3,
        tension: 40,
        useNativeDriver: true
      }),
      Animated.spring(dotScale, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true
      })
    ]).start();
  };

  const handlePatternComplete = async (): Promise<void> => {
    setCurrentLine({ start: null, end: null });

    if (pattern.length < 3) {
      setError('Ingresa un patrón mínimo de 3 dígitos');
      setPattern([]);
      return;
    }

    if (isFirstPattern) {
      setFirstPattern(pattern);
      setMessage('Verifica tu Patrón');
      setPattern([]);
      setIsFirstPattern(false);
      setError('');
    } else {
      if (JSON.stringify(pattern) === JSON.stringify(firstPattern)) {
        setMessage('');
        setError('');
        setIsPatternSuccess(true);
        onPatronComplete(pattern);

        await AsyncStorage.setItem('pattern', JSON.stringify(pattern));
      } else {
        setMessage('Verifica tu Patrón');
        setPattern([]);
        setError('Patrón incorrecto. Intenta de nuevo');
        setIsPatternSuccess(false);
      }
    }
  };

  useEffect(() => {
    const loadPattern = async (): Promise<void> => {
      const storedPattern = await AsyncStorage.getItem('pattern');
      if (storedPattern) {
        setFirstPattern(JSON.parse(storedPattern));
        setMessage('Verifica tu Patrón');
        setIsFirstPattern(false);
      }
    };

    loadPattern();
  }, []);

  useEffect(() => {
    if (isPatternSuccess) {
      const timeout = setTimeout(() => {
        router.replace("/Entrepise");
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [isPatternSuccess, router]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,

    onPanResponderGrant: (evt) => {
      const { pageX, pageY } = evt.nativeEvent;
      gridRef.current?.measure((x, y, width, height, pageXOffset, pageYOffset) => {
        const rect = { x: pageXOffset, y: pageYOffset, width, height };
        const point = getNearestPoint(pageX, pageY, rect);
        if (point) {
          setPattern([point]);
          currentPoint.current = point;
          animateDot();
        }
      });
    },

    onPanResponderMove: (evt) => {
      const { pageX, pageY } = evt.nativeEvent;
      gridRef.current?.measure((x, y, width, height, pageXOffset, pageYOffset) => {
        const rect = { x: pageXOffset, y: pageYOffset, width, height };
        const point = getNearestPoint(pageX, pageY, rect);
        
        if (point && point !== currentPoint.current && isAdjacent(currentPoint.current, point)) {
          if (!pattern.includes(point)) {
            setPattern(prev => [...prev, point]);
            currentPoint.current = point;
            animateDot();
          }
        }

        if (currentPoint.current !== null) {
          setCurrentLine({
            start: points[currentPoint.current - 1].position,
            end: { x: pageX, y: pageY }
          });
        }
      });
    },
    
    onPanResponderRelease: handlePatternComplete
  });

  return (
    <View style={styles.container}>
      {isPatternSuccess ? null : <Text style={styles.message}>{message}</Text>}
      
      <View ref={gridRef} style={styles.grid} {...panResponder.panHandlers}>
        {points.map((point) => (
          <Animated.View
            key={point.id}
            style={[
              styles.point,
              pattern.includes(point.id) && styles.selectedPoint,
            ]}
          />
        ))}
      </View>

      {isPatternSuccess && (
        <Text style={styles.success}>Verificación Exitosa</Text>
      )}

      {(error && !isPatternSuccess) && (
        <Text style={styles.error}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 280,
    justifyContent: 'center',
    padding: 10,
  },
  point: {
    width: 50,
    height: 50,
    borderRadius: 20,
    backgroundColor: '#D9D9D9',
    margin: 18,
  },
  selectedPoint: {
    backgroundColor: '#06358DFF',
  },
  message: {
    fontSize: 18,
    marginTop: 24,
    color: '#06358DFF',
  },
  error: {
    fontSize: 16,
    color: 'red',
    marginTop: 10,
  },
  success: {
    fontSize: 16,
    color: '#06358DFF',
    marginTop: 14,
  },
});

export default PatronInput;