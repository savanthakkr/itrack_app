import React from 'react';
import {TouchableOpacity, View, Text, StyleSheet} from 'react-native';

const RadioButton = ({label, selected, onSelect}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onSelect}>
      <View style={[styles.radio, selected && styles.selected]}>
        {selected && <View style={styles.innerCircle} />}
      </View>
      {label && <Text style={styles.label}>{label}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    borderColor: '#000',
  },
  innerCircle: {
    width: 10,
    height: 10,
    borderRadius: 6,
    backgroundColor: '#000',
  },
  label: {
    fontSize: 12,
    color: '#333',
    marginLeft: 10,
  },
});

export default RadioButton;
