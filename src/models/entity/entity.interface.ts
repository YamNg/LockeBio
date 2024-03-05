// interface classes for specifying signature of common entity properties
export interface Entity {
  id?: string;
  createAt?: Date;
  updateAt?: Date;
  isActive?: boolean;
}

export interface StatefulEntity extends Entity {
  status: string;
}
