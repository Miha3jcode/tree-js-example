import './List.scss';
import React from 'react';
import PropTypes from 'prop-types';
import {ReactComponent as CloseSvg} from 'svgs/close.svg';

List.propTypes = {
  className: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.exact({
    id: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]).isRequired,
    text: PropTypes.string.isRequired,
  })).isRequired,
  onDeleteButtonClick: PropTypes.func.isRequired,
};

function List({className, items, onDeleteButtonClick, ...props}) {
  return (
    <ul
      {...props}
      className={[
        'list',
        className,
      ].join(' ')}
    >
      {
        items?.map(item => {

          function handleOnClick(event) {
            if (!onDeleteButtonClick) return;

            onDeleteButtonClick(event, item.id);
          }

          return (
            <li className={'list__item'} key={String(item.id)}>
              <p className={'list__text'}>{item.text}</p>
              <CloseSvg
                className={'list__delete-button'}
                onClick={handleOnClick}
              />
            </li>
          )
        })
      }
    </ul>
  );
}

export default List;