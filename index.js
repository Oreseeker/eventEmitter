/**
 * @callback Callback
 * */

/**
 * @typedef {object} OnOptions
 * @property {EventId} [id]
 * @property {boolean} [once]
 * */

/**
 * @typedef {object} Config
 * @property {Callback} callback
 * @property {OnOptions['id']} [id]
 * @property {OnOptions['once']} once
 * */

/**
 * @typedef {string|number} EventId
 * */


/**
 * @typedef {object} EmitOptions
 * @property {boolean} [postponed]
 * @property data
 * @property {boolean} [once]
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

  #getNewEventId() {
    return new Date().getTime();
  }

  /**
   * @param {Callback} callback
   * @param {OnOptions} [options]
   * @return {Config}
   * */
  #formConfig(callback, { once = false } = {}) {
    return {
      callback,
      once,
      id: this.#getNewEventId(),
    };
  }

  /**
   * Регист
   * @param {EventTitle} eventTitle  Название события
   * @param {Callback} callback
   * @param {OnOptions} [options]
   * */
  on(eventTitle, callback, options) {
    const title = eventTitle.toLowerCase();
    const payload = this.#formConfig(callback, options);

    if (!(title in this._registry)) {
      this._registry[title] = [payload];
    } else {
      this._registry[title].push(payload);
    }

    this._postponedEvents.forEach(({ eventTitle, data }) => this.emit(eventTitle, { data }));

    return { id: payload.id };
  }

  /**
   * @param {EventTitle} eventTitle
   * @param {EventId} id
   * */
  remove(eventTitle, id) {
    console.log('id', id);
    const title = eventTitle.toLowerCase();
    if (!(title in this._registry)) throw Error('Указаное событие не зарегистрировано');
    const eventCfgs = this._registry[title];
    const index = eventCfgs.findIndex(el => el.id === id);
    if (index === -1) throw Error('События с указанным id не существует')
    eventCfgs.splice(index, 1);
    console.log('eventCfgs', eventCfgs);
    if (!eventCfgs.length) {
      delete this._registry[title];
    }
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
      throw Error('Обработчики для данного события не зарегистрированы. Если вы хотите, чтобы' +
        'событие отработало в момент регистрации с указанными данными, воспользуйтесь флагом postponed');
    }

    const cfgs = this._registry[eventTitle];
    const cfgsToRemove = [];
    cfgs.forEach(cfg => {
      cfg.callback(data);
      if (cfg.once) cfgsToRemove.push({ ...cfg });
    });

    cfgsToRemove.forEach(cfg => this.remove(eventTitle, cfg.id));
  }
}
