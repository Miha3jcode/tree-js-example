import './Select.scss';

import React from 'react';
import PropTypes from 'prop-types';

Select.propTypes = {
  className: PropTypes.string,
};

function Select({className, ...props}) {
  return (
    <select
      {...props}
      className={[
        'select',
        className,
      ].join(' ')}
    />
  );
}

export default Select;