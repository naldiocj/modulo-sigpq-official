import { FuncionarioINPUT } from '../dto/FuncionarioDto';

export default interface IFuncionarioRepository {
  get(id: number): Promise<any>;
  store(input: FuncionarioINPUT): Promise<any>;
  getAll(options?: any): Promise<any>;
  update(id: number, input?: any): Promise<any>;
}
