interface event {
  type: string,
  listener: Function[]
}
export default class EventEmitter {
  events: event[]

  constructor() {
    this.events = []
  }

  private create(type: string) {
    const curr: event = {type: type, listener: []}
    this.events.push(curr)
    return curr
  }
  getOrCreate(type) {
    const find = this.events.find(event => event.type === type)
    return find ? find : this.create(type)
  }

  get(type) {
    const find = this.events.find(event => event.type === type)
    return find
  }
  on(event: string, listener: Function) {
    const e = this.getOrCreate(event)
    e.listener.push(listener)
  }

  off(event) {
    const e = this.get(event)
    if (e) {
      e.listener = []
    }
  }

  emit(event: string, args, that) {
    const e = this.get(event)
    if (e) {
      e.listener.forEach(listener => listener.apply(that, args))
    }
  }
}