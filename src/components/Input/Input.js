import './Input.scss';

import React from 'react';
import PropTypes from 'prop-types';

Input.propTypes = {
  className: PropTypes.string,
};

function Input({className, ...props}) {
  return (
    <input
      {...props}
      className={[
        'input',
        className,
      ].join(' ')}
    />
  );
}

export default Input;