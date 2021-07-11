import './Button.scss';

import React from 'react';
import PropTypes from 'prop-types';

Button.propTypes = {
  className: PropTypes.string,
};

function Button({className, ...props}) {
  return (
    <button
      {...props}
      className={[
        'button',
        className,
      ].join(' ')}
    />
  );
}

export default Button;