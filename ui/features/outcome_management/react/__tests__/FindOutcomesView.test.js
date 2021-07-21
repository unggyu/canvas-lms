/*
 * Copyright (C) 2021 - present Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3 of the License.
 *
 * Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react'
import {render, fireEvent, within} from '@testing-library/react'
import FindOutcomesView from '../FindOutcomesView'
import {isRTL} from '@canvas/i18n/rtlHelper'

jest.mock('@canvas/i18n/rtlHelper')

describe('FindOutcomesView', () => {
  let onChangeHandlerMock
  let onClearHandlerMock
  let onAddAllHandlerMock
  let onLoadMoreHandlerMock
  const defaultProps = (props = {}) => ({
    collection: {
      id: '1',
      name: 'State Standards'
    },
    outcomesCount: 3,
    outcomes: {
      edges: [
        {
          node: {
            _id: '11',
            title: 'Outcome 1',
            description: 'Outcome 1 description',
            isImported: false
          }
        }
      ],
      pageInfo: {
        endCursor: 'abc',
        hasNextPage: true
      }
    },
    loading: false,
    searchString: '',
    onChangeHandler: onChangeHandlerMock,
    onClearHandler: onClearHandlerMock,
    onAddAllHandler: onAddAllHandlerMock,
    loadMore: onLoadMoreHandlerMock,
    ...props
  })

  beforeEach(() => {
    onChangeHandlerMock = jest.fn()
    onClearHandlerMock = jest.fn()
    onAddAllHandlerMock = jest.fn()
    onLoadMoreHandlerMock = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders component with the correct group name and search bar placeholder', () => {
    const {getByText, getByPlaceholderText} = render(<FindOutcomesView {...defaultProps()} />)
    expect(getByText('State Standards')).toBeInTheDocument()
    expect(getByPlaceholderText('Search within State Standards')).toBeInTheDocument()
  })

  it('renders component with default group name and search bar placeholder if name is missing in props', () => {
    const {getByText, getByPlaceholderText} = render(
      <FindOutcomesView
        {...defaultProps({
          collection: {
            ...defaultProps().collection,
            name: null
          }
        })}
      />
    )
    expect(getByText('Outcome Group')).toBeInTheDocument()
    expect(getByPlaceholderText('Search within Outcome Group')).toBeInTheDocument()
  })

  it('renders component with correct number of outcomes', () => {
    const {getByText} = render(<FindOutcomesView {...defaultProps()} />)
    expect(getByText('3 Outcomes')).toBeInTheDocument()
  })

  it('sets default outcomes to 0 if missing in collection', () => {
    const {getByText} = render(
      <FindOutcomesView
        {...defaultProps({
          outcomesCount: 0
        })}
      />
    )
    expect(getByText('0 Outcomes')).toBeInTheDocument()
  })

  it('calls onChangeHandler when users types in searchbar', () => {
    const {getByDisplayValue} = render(
      <FindOutcomesView {...defaultProps({searchString: '123'})} />
    )
    const input = getByDisplayValue('123')
    fireEvent.change(input, {target: {value: 'test'}})
    expect(onChangeHandlerMock).toHaveBeenCalled()
  })

  it('render a message when search does not return any result', () => {
    const {queryByText} = render(
      <FindOutcomesView
        {...defaultProps({
          searchString: 'abc',
          outcomes: {
            edges: []
          }
        })}
      />
    )
    expect(queryByText('The search returned no results')).toBeInTheDocument()
  })

  it('does not render a message when does not have search when group does not have outcome', () => {
    const {queryByText} = render(
      <FindOutcomesView
        {...defaultProps({
          outcomes: {
            edges: []
          }
        })}
      />
    )
    expect(queryByText('The search returned no results')).not.toBeInTheDocument()
  })

  it('calls onClearHandler on click on clear search button', () => {
    const {getByText} = render(<FindOutcomesView {...defaultProps({searchString: '123'})} />)
    const btn = getByText('Clear search field')
    fireEvent.click(btn)
    expect(onClearHandlerMock).toHaveBeenCalled()
  })

  it('calls onAddAllHandler on click on "Add All Outcomes" button', () => {
    const {getByText} = render(<FindOutcomesView {...defaultProps()} />)
    const btn = getByText('Add All Outcomes')
    fireEvent.click(btn)
    expect(onAddAllHandlerMock).toHaveBeenCalled()
  })

  it('shows outcome as not added when outcome has not been imnported', () => {
    const {getAllByText} = render(<FindOutcomesView {...defaultProps()} />)
    const addButton = getAllByText('Add')[0].closest('button')
    expect(addButton).not.toBeDisabled()
  })

  it('shows outcome as added when outcome is already imported', () => {
    const importedOutcome = {
      outcomes: {
        edges: [
          {
            node: {
              _id: '11',
              title: 'Outcome 1',
              description: 'Outcome 1 description',
              isImported: true
            }
          }
        ],
        pageInfo: {
          endCursor: 'abc',
          hasNextPage: true
        }
      }
    }
    const {getAllByText} = render(<FindOutcomesView {...defaultProps(importedOutcome)} />)
    const addButton = getAllByText('Added')[0].closest('button')
    expect(addButton).toBeDisabled()
  })

  it('shows outcome as added when Add button is clicked', () => {
    const {getAllByText} = render(<FindOutcomesView {...defaultProps()} />)
    const addButton = getAllByText('Add')[0].closest('button')
    fireEvent.click(addButton)
    expect(addButton).toBeDisabled()
  })

  it('disables "Add All Outcomes" button if number of outcomes eq 0', () => {
    const {getByText} = render(
      <FindOutcomesView
        {...defaultProps({
          outcomesCount: 0
        })}
      />
    )
    expect(getByText('Add All Outcomes').closest('button')).toBeDisabled()
  })

  it('hides the "Add All Outcomes" button if the collection is a root group', () => {
    const {queryByText} = render(
      <FindOutcomesView
        {...defaultProps({
          collection: {
            ...defaultProps().collection,
            isRootGroup: true
          }
        })}
      />
    )
    expect(queryByText('Add All Outcomes')).not.toBeInTheDocument()
  })

  it('hides "Add All Outcomes" button if search string is present', () => {
    const {queryByText} = render(<FindOutcomesView {...defaultProps({searchString: 'test'})} />)
    expect(queryByText('Add All Outcomes')).not.toBeInTheDocument()
  })

  it('shows large loader if data is loading and outcomes are missing/undefined', () => {
    const {getByTestId} = render(
      <FindOutcomesView {...defaultProps({loading: true, outcomes: null})} />
    )
    expect(getByTestId('loading')).toBeInTheDocument()
  })

  it('shows "Load More" button if there are more outcomes and data is loaded', () => {
    const {getByText} = render(<FindOutcomesView {...defaultProps()} />)
    expect(getByText('Load More')).toBeInTheDocument()
  })

  it('shows small loader if there are more outcomes and data is loading', () => {
    const {getByTestId} = render(<FindOutcomesView {...defaultProps({loading: true})} />)
    expect(getByTestId('load-more-loading')).toBeInTheDocument()
  })

  it('shows small loader when searching for outcomes', () => {
    const {getByTestId} = render(
      <FindOutcomesView {...defaultProps({loading: true, searchString: 'test'})} />
    )
    expect(getByTestId('search-loading')).toBeInTheDocument()
  })

  it('shows in search breadcrumb right arrow icon with screen reader accessible title', () => {
    const {getByTitle} = render(
      <FindOutcomesView {...defaultProps({loading: true, searchString: 'test'})} />
    )
    expect(getByTitle('search results for')).toBeInTheDocument()
  })

  it('flips order of search term and outcome title if RTL is enabled', () => {
    isRTL.mockReturnValue(false)
    const {getByTestId, rerender} = render(
      <FindOutcomesView {...defaultProps({loading: true, searchString: 'ltrtest'})} />
    )
    expect(within(getByTestId('group-name-ltr')).getByText('State Standards')).toBeTruthy()
    expect(within(getByTestId('search-string-ltr')).getByText('ltrtest')).toBeTruthy()
    isRTL.mockReturnValue(true)
    rerender(<FindOutcomesView {...defaultProps({loading: true, searchString: 'rtltest'})} />)
    expect(within(getByTestId('group-name-ltr')).getByText('rtltest')).toBeTruthy()
    expect(within(getByTestId('search-string-ltr')).getByText('State Standards')).toBeTruthy()
  })
})
