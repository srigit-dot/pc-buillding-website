import React, { createContext, useContext, useState } from 'react';

const BuildContext = createContext();

const COMPONENT_ORDER = {
  'motherboard': 1,
  'cpu': 2,
  'cpu-cooler': 3,
  'memory': 4,
  'video-card': 5,
  'internal-hard-drive': 6,
  'power-supply': 7,
  'case': 8,
  'case-fan': 9,
  'case-accessory': 10,
  'thermal-paste': 11,
  'os': 12,
  'monitor': 13,
  'keyboard': 14,
  'mouse': 15,
  'headphones': 16,
  'speakers': 17,
  'webcam': 18,
  'external-hard-drive': 19,
  'fan-controller': 20,
  'optical-drive': 21,
  'sound-card': 22,
  'wired-network-card': 23,
  'wireless-network-card': 24,
  'ups': 25
};

const REQUIRED_COMPONENTS = [
  'motherboard',
  'cpu',
  'memory',
  'power-supply',
  'case',
  'os'
];

export const BuildProvider = ({ children }) => {
  const [buildComponents, setBuildComponents] = useState({});
  const [currentStep, setCurrentStep] = useState(1);

  const isComponentRequired = (category) => {
    return REQUIRED_COMPONENTS.includes(category);
  };

  const canAddComponent = (category) => {
    // Always allow required components
    if (isComponentRequired(category)) return true;

    // Check if prerequisites are met
    switch (category) {
      case 'cpu-cooler':
        return buildComponents['cpu'] !== undefined;
      case 'case-fan':
      case 'case-accessory':
        return buildComponents['case'] !== undefined;
      case 'thermal-paste':
        return buildComponents['cpu'] !== undefined && buildComponents['cpu-cooler'] !== undefined;
      case 'video-card':
        return buildComponents['motherboard'] !== undefined && buildComponents['power-supply'] !== undefined;
      default:
        return true;
    }
  };

  const getNextRequiredComponent = () => {
    return REQUIRED_COMPONENTS.find(component => !buildComponents[component]);
  };

  const addComponent = (category, product) => {
    if (!canAddComponent(category)) {
      throw new Error('Prerequisites not met for this component');
    }

    setBuildComponents(prev => ({
      ...prev,
      [category]: product
    }));

    // Update current step
    const nextRequired = getNextRequiredComponent();
    if (nextRequired) {
      setCurrentStep(COMPONENT_ORDER[nextRequired]);
    }
  };

  const removeComponent = (category) => {
    // Check if any dependent components need to be removed
    const dependentComponents = Object.entries(buildComponents).filter(([comp, _]) => {
      switch (comp) {
        case 'cpu-cooler':
          return category === 'cpu';
        case 'case-fan':
        case 'case-accessory':
          return category === 'case';
        case 'thermal-paste':
          return category === 'cpu' || category === 'cpu-cooler';
        default:
          return false;
      }
    }).map(([comp, _]) => comp);

    setBuildComponents(prev => {
      const updated = { ...prev };
      delete updated[category];
      dependentComponents.forEach(comp => delete updated[comp]);
      return updated;
    });
  };

  const getMissingComponents = () => {
    return REQUIRED_COMPONENTS.filter(component => !buildComponents[component]);
  };

  const getRecommendedNext = () => {
    const missing = getMissingComponents();
    return missing.length > 0 ? missing[0] : null;
  };

  return (
    <BuildContext.Provider
      value={{
        buildComponents,
        currentStep,
        addComponent,
        removeComponent,
        canAddComponent,
        isComponentRequired,
        getMissingComponents,
        getRecommendedNext
      }}
    >
      {children}
    </BuildContext.Provider>
  );
};

export const useBuild = () => {
  const context = useContext(BuildContext);
  if (!context) {
    throw new Error('useBuild must be used within a BuildProvider');
  }
  return context;
}; 