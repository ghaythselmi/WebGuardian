import { User } from './user';
export class Website {
    id?: number;
    url?: string;
    availability?: string;
    ssl_status?: string;
    expires_in?: number;
    user_id?: number;
    last_check?: Date; 
  }