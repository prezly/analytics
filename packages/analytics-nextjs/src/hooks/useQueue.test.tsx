import { fireEvent, render } from '@testing-library/react';
import '@testing-library/jest-dom';

import { useQueue } from './useQueue';

function TestingComponent({ initialValue }: { initialValue?: string[] }) {
    const { add, remove, first, last, size } = useQueue<string>(initialValue);

    return (
        <div>
            <p>First item in queue: {first ?? 'n/a'}</p>
            <p>Last item in queue: {last ?? 'n/a'}</p>
            <p>Queue size: {size}</p>
            <button onClick={() => add('test')}>Add item to queue</button>
            <button onClick={() => remove()}>Remove item from queue</button>
        </div>
    );
}

it('returns correct initial values (empty argument)', () => {
    const { getByText } = render(<TestingComponent />);

    expect(getByText(/first/i)).toHaveTextContent('n/a');
    expect(getByText(/last/i)).toHaveTextContent('n/a');
    expect(getByText(/size/i)).toHaveTextContent('0');
});

it('returns correct initial values (argument provided)', () => {
    const { getByText } = render(<TestingComponent initialValue={['A', 'B']} />);

    expect(getByText(/first/i)).toHaveTextContent('A');
    expect(getByText(/last/i)).toHaveTextContent('B');
    expect(getByText(/size/i)).toHaveTextContent('2');
});

it('adding to queue works', async () => {
    const { getByText } = render(<TestingComponent initialValue={['A', 'B']} />);

    expect(getByText(/first/i)).toHaveTextContent('A');
    expect(getByText(/last/i)).toHaveTextContent('B');
    expect(getByText(/size/i)).toHaveTextContent('2');

    fireEvent.click(getByText(/add/i));

    expect(getByText(/first/i)).toHaveTextContent('A');
    expect(getByText(/last/i)).toHaveTextContent('test');
    expect(getByText(/size/i)).toHaveTextContent('3');
});

it('removing from queue works', async () => {
    const { getByText } = render(<TestingComponent initialValue={['A', 'B']} />);

    expect(getByText(/first/i)).toHaveTextContent('A');
    expect(getByText(/last/i)).toHaveTextContent('B');
    expect(getByText(/size/i)).toHaveTextContent('2');

    fireEvent.click(getByText(/remove/i));

    expect(getByText(/first/i)).toHaveTextContent('B');
    expect(getByText(/last/i)).toHaveTextContent('B');
    expect(getByText(/size/i)).toHaveTextContent('1');
});
