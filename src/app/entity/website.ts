import { User } from './user';
export class Website {
    id?: number;
    url?: string;
    availability?: string;
    ssl_status?: string;
    expires_in?: number;
    user_id?: number;
    last_check?: Date; 
    http_status_code?: number | null;
    response_time_ms?: number | null;
    final_url?: string | null;
    page_title?: string | null;
    ssl_issuer?: string | null;
    ssl_expires_at?: string | null;
    headers_score?: number | null;
    headers_grade?: string | null;
    security_headers_present?: string[] | null;
    security_headers_missing?: string[] | null;
  }
