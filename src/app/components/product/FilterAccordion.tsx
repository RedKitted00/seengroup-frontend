import React from 'react';
import { FilterState } from '@/hooks/useProductFilter';
import { FilterCategory } from '@/lib/api/productFilterApi';
import Icon from '../ui/Icon';

interface FilterAccordionProps {
  title: string;
  category: keyof FilterState;
  isActive: boolean;
  onToggle: (category: string) => void;
  onFilterChange: (category: keyof FilterState, value: string, checked: boolean) => void;
  activeFilters: FilterState;
  children?: React.ReactNode;
  dataId?: string;
  filterCount?: number;
  categories?: FilterCategory[];
}

export const FilterAccordion: React.FC<FilterAccordionProps> = ({
  title,
  category,
  isActive,
  onToggle,
  onFilterChange,
  activeFilters,
  children,
  dataId,
  filterCount,
  categories
}) => {

  return (
    <>
      {categories && categories.length > 0 ? (
        <>
          {categories.map((cat) => {
            const isCatActive = activeFilters[category].includes(cat.id);
            const subs = cat.subcategories || [];
            return (
              <div key={cat.id} className="sei-accordion-item">
                <div
                  className={`sei-top-category-buttons ${isActive ? 'active' : ''}`}
                  role="tablist"
                  aria-label={`${title} categories`}
                  id={`accordion-header-${category}-${cat.id}`}
                  data-id={dataId}
                >
                  <div className={`sei-top-category-group ${isCatActive ? 'active' : ''}`}>
                    <button
                      className={`sei-accordion-header sei-filter-oem-cat-tab-btn ${isCatActive ? 'active' : ''}`}
                      type="button"
                      role="tab"
                      aria-selected={isCatActive}
                      aria-controls={`accordion-${category}-${cat.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isCatActive && isActive) {
                          // Toggle close if clicking the already active top category while open
                          onToggle(String(category));
                        } else {
                          // Activate this category and ensure the accordion is open
                          onFilterChange(category, cat.id, true);
                          if (!isActive) onToggle(String(category));
                        }
                      }}
                    >
                      <div className="sei-accordion-title">{cat.name}</div>
                      <span className="sei-arrow" aria-hidden="true">
                        <Icon name="icon-mini-right" size={16} />
                      </span>
                    </button>
                    {(isCatActive && isActive) && (
                      <div
                        className="sei-accordion-content open"
                        id={`accordion-${category}-${cat.id}`}
                        role="region"
                        aria-labelledby={`accordion-header-${category}-${cat.id}`}
                      >
                        <ul className="sei-checkbox-list" role="group" aria-label={`${title} filters`}>
                          <ul className="sei-subcategory-list" role="group" aria-label={`${cat.name} subcategories`}>
                            <li>
                              <label>
                                <input
                                  type="radio"
                                  name={`subcategory-${cat.id}`}
                                  value="Show All"
                                  className="sei-filter-oem-cat-cb"
                                  checked={activeFilters.components.includes('Show All')}
                                  onChange={() => onFilterChange('components', 'Show All', true)}
                                  aria-label="Show all subcategories"
                                />
                                <span>Show All</span>
                              </label>
                            </li>
                            {subs.map((sub) => (
                              <li key={sub.id}>
                                <label>
                                  <input
                                    type="radio"
                                    name={`subcategory-${cat.id}`}
                                    value={sub.id}
                                    className="sei-filter-oem-cat-cb"
                                    checked={activeFilters.components.includes(sub.id)}
                                    onChange={() => onFilterChange('components', sub.id, true)}
                                    aria-label={sub.name}
                                  />
                                  <span>{sub.name}</span>
                                </label>
                              </li>
                            ))}
                          </ul>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
       </>
          ) : (
          <div className="sei-accordion-item">
            <div className="sei-top-category-group">
              <button
                className={`sei-accordion-header sei-filter-oem-cat-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => onToggle(category)}
                data-id={dataId}
                aria-expanded={isActive}
                aria-controls={`accordion-${category}`}
                id={`accordion-header-${category}`}
              >
                <div className="sei-accordion-title">
                  {title}
                  {filterCount !== undefined && filterCount > 0 && (
                    <span className="sei-filter-count">({filterCount})</span>
                  )}
                </div>
                <span className="sei-arrow" aria-hidden="true">
                  <Icon name="icon-mini-down" size={16} />
                </span>
              </button>
              {isActive && (
                <div className="sei-accordion-content open" id={`accordion-${category}`} role="region" aria-labelledby={`accordion-header-${category}`}>
                  <ul className="sei-checkbox-list" role="group" aria-label={`${title} filters`}>
                    {children}
                  </ul>
                </div>
              )}
            </div>
          </div>
      )}
        </>
      );
};

      interface FilterCheckboxProps {
        value: string;
      label: string;
      checked: boolean;
  onChange: (value: string, checked: boolean) => void;
}

      export const FilterCheckbox: React.FC<FilterCheckboxProps> = ({
        value,
        label,
        checked,
        onChange
      }) => {
  return (
        <li>
          <label>
            <input
              type="checkbox"
              value={value}
              className="sei-filter-oem-cat-cb"
              checked={checked}
              onChange={(e) => onChange(value, e.target.checked)}
              aria-label={label}
            />
            <span>{label}</span>
          </label>
        </li>
        );
};

