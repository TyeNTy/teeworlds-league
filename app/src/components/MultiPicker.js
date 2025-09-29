import React from "react";

const MultiPicker = ({ 
  items = [], 
  renderItem, 
  selectedItems = [], 
  onSelectionChange,
  className = "",
  itemClassName = "",
  selectedItemClassName = ""
}) => {
  const handleItemClick = (item) => {
    const isSelected = selectedItems.some(selected => 
      JSON.stringify(selected) === JSON.stringify(item)
    );
    
    let newSelection;
    if (isSelected) {
      newSelection = selectedItems.filter(selected => 
        JSON.stringify(selected) !== JSON.stringify(item)
      );
    } else {
      newSelection = [...selectedItems, item];
    }
    
    onSelectionChange?.(newSelection);
  };

  const isItemSelected = (item) => {
    return selectedItems.some(selected => 
      JSON.stringify(selected) === JSON.stringify(item)
    );
  };

  return (
    <div className={`multi-picker ${className}`}>
      {items.map((item, index) => {
        const isSelected = isItemSelected(item);
        const defaultItemClasses = `
          cursor-pointer p-2 rounded-md transition-colors duration-200
          ${isSelected 
            ? 'bg-blue-500 text-white hover:bg-blue-600' 
            : 'bg-gray-100 hover:bg-gray-200'
          }
        `;
        
        return (
          <div
            key={index}
            className={`${defaultItemClasses} ${itemClassName} ${isSelected ? selectedItemClassName : ''}`}
            onClick={() => handleItemClick(item)}
          >
            {renderItem ? renderItem(item, isSelected) : JSON.stringify(item)}
          </div>
        );
      })}
    </div>
  );
};

export default MultiPicker;
