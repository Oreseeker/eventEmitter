import { EventEmitter } from '../index.js';

const eventEmitter = new EventEmitter()

describe('Event emitter tests', () => {
  test('No options', () => {
    let counter = 0;
    eventEmitter.on('test event', () => {
      counter++
    });

    eventEmitter.emit('test event');

    expect(counter).toBe(1);
  });
  //
  // test('With data', () => {
  //   const eventTitle = 'test event 2';
  //   const data = 'test data';
  //   let emittedValue;
  //   eventEmitter.on(eventTitle, (d) => {
  //     emittedValue = d;
  //   });
  //
  //   eventEmitter.emit(eventTitle, { data });
  //
  //   expect(emittedValue).toBe(data);
  // });

  test('Call handler only once', () => {
    const eventTitle = 'test event 2';
    let counter = 0;
    eventEmitter.on(eventTitle, () => {
      counter++
    }, { once: true });


    eventEmitter.emit(eventTitle);

    expect(counter).toBe(1);

    expect(() => eventEmitter.emit(eventTitle)).toThrowError()
  });


  test('Postponed event', () => {
    let counter = 0;
    const eventTitle = 'not registered event';
    eventEmitter.emit(eventTitle, { postponed: true });

    eventEmitter.on(eventTitle, () => {
      counter++;
    });

    expect(counter).toBe(1);
  });

  test('Remove listener by hand', () => {
    let counter = 0;
    const eventTitle = 'removed event';

    const { id: eventId } = eventEmitter.on(eventTitle, () => {
      counter++;
    });

    eventEmitter.emit(eventTitle);
    eventEmitter.emit(eventTitle);
    eventEmitter.emit(eventTitle);

    eventEmitter.remove(eventTitle, eventId);

    expect(() => eventEmitter.emit(eventTitle)).toThrowError();

    expect(counter).toBe(3);
  });
});
