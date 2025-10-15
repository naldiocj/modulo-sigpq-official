export interface Options {
  createdAt?: Date
  updatedAt?: Date
}

export abstract class Entity<T> {
  protected readonly _createdAt: Date
  protected readonly _updatedAt: Date
  protected readonly props: T

  protected constructor(props: T, options?: Options) {
    this.props = props
    this._createdAt = options?.createdAt || new Date()
    this._updatedAt = options?.updatedAt || new Date()
  }

  public get createdAt(): Date {
    return this._createdAt
  }

  public get updatedAt(): Date {
    return this._updatedAt
  }
}
