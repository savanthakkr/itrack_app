import React from 'react';
import {TouchableOpacity, View, Text, StyleSheet, Image} from 'react-native';

const CheckBox = ({label, checked, onChange}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onChange(!checked)}>
      <View style={[styles.checkbox, checked && styles.checked]}>
        {checked && (
          <Image
            source={require('../../../assets/Icon/check.png')}
            style={styles.checkIcon}
          />
        )}
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
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: {
    backgroundColor: '#FFF',
    borderColor: '#000',
  },
  innerCheckbox: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  checkIcon: {
    height: 16,
    width: 16,
  },
});

export default CheckBox;
