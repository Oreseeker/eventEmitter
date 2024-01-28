/**
 * @callback Callback
 * */

/**
 * @typedef {object} Config
 * @property {Callback} callback
 * */

/**
 * @typedef {string|number} EventId
 * */

/**
 * @typedef {object} Options
 * @property {EventId} [id]
 * */

/**
 * @typedef {object} EmitOptions
 * @property {boolean} [postponed]
 * @property data
 * */

/**
 * @typedef {object} PostponedEvent
 * @property {EventTitle} eventTitle
 * @property data
 * */

/**
 * @typedef {string} EventTitle
 * */

/**
 * @typedef {Record<string, Config[]>} Registry
 * */

export class EventEmitter {
  /** @type {Registry}*/
  _registry = {};

  /**
   * @type {PostponedEvent[]}
   * */
  _postponedEvents = [];

  /** TODO дата валидатор (чтобы при эмитах нужные данные были */

  /**
   * Регист
   * @param {EventTitle} eventTitle  Название события
   * @param {Callback} callback
   * @param {Options} [options]
   * */
  on(eventTitle, callback, options) {
    const title = eventTitle.toLowerCase();
    const payload = { callback };

    if (!(title in this._registry)) {
      this._registry[title] = [payload];
    } else {
      if (options && 'id' in options) {
        const cfg = this._registry[title].find(cfg => cfg.id === options.id);
        if (cfg) throw Error('Событие с указанным идентификатором уже существует');
      }

      this._registry[title].push(payload);
    }

    this._postponedEvents.forEach(({ eventTitle, data }) => this.emit(eventTitle, { data }));
  }

  /**
   * @param {EventTitle} eventTitle
   * @param {EventId} id
   * */
  remove(eventTitle, id) {
    const title = eventTitle.toLowerCase();
    if (!(title in this._registry)) throw Error('Указаное событие не зарегистрировано');
    const eventCfgs = this._registry[title];
    const index = eventCfgs[title].findIndex(el => el.id === id);
    if (index === -1) throw Error('События с указанным id не существует')
    eventCfgs.splice(index, 1);
  }

  /**
   * @param {EventTitle} eventTitle
   * @param {EmitOptions} [options]
  */
  emit(eventTitle, { postponed, data } = { postponed: false }) {
    const title = eventTitle.toLowerCase();

    const inRegistry = title in this._registry;

    if (!inRegistry && postponed) {
      /* TODO убирать повторяющиеся события, сделать eventTitle уникальным по массиву*/
      this._postponedEvents = [{ eventTitle, data }];
      return;
    } else if (!inRegistry && !postponed) {
      throw Error('Обработчики для данного события не зарегистрированы.');
    }

    const cfgs = this._registry[eventTitle];
    cfgs.forEach(cfg => cfg.callback(data));
  }
}
