export interface DataForSeoTaskResultItem {
  id: string;
  status_code: number;
  status_message: string;
  cost: number;
  time: string;
  [key: string]: unknown;
}

export interface DataForSeoLiveResponse {
  version: string;
  status_code: number;
  status_message: string;
  tasks: DataForSeoTaskResultItem[];
}

export interface DataForSeoTaskResult {
  task_id: string;
  status_code: number;
  status_message: string;
  cost: number;
  time: string;
  keyword: string;
  location_code: number;
  language_code: string;
  priority: number;
  rawResult: DataForSeoTaskResultItem;
}
