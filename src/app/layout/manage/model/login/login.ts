import { Menu } from '../menu/menu';
import { User } from '../user/user';

export class Login {
    token: string;
    menu: Menu[];
    user: User;
    isLocked: boolean;
    isLoginOk: boolean;

}
