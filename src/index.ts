import fetch, { Headers, RequestInit } from "node-fetch";
import querystring from "querystring";

export type ManagedElement = 'workspace'|'component'|'reference';
export class ArdoqAPI {
	
	constructor(protected accessToken : string, protected basePath: string) {}

	async request(endpoint : string = "", options: RequestInit = {}, params: any = {}): Promise<any> {  
		let url = this.basePath + '/api/' + endpoint;
		// sanitize method
		options.method = options.method || 'GET';
		// sanitize headers
		options.headers = new Headers(options.headers);
		// add needed headers for Ardoq
		options.headers.append('Content-Type', 'application/json');
		options.headers.append('Authorization', 'Token token='+this.accessToken);
		const pars = querystring.stringify(params);
		if (pars!= "") url += "?" + pars;
		//console.debug("fetching " + url + "\n\toptions=" + JSON.stringify(options));
		const response = await fetch(url, options);
		if (response.ok && response.status == 200) {
			const json = await response.json();
			//console.debug("fetch result: ", json);
			return json;
		}
		console.debug("fetching " + url + "\n\toptions=" + JSON.stringify(options));
		console.error("fetch error: status=", response.status, " message=", response.statusText);
		return Promise.reject(response); 
	}
	// workspace API
	async getAllWorkspaces() { return await this.request("workspace"); }
	async getWorkspaceById(id: string) { return await this.request('workspace/' + id) }
	async createWorkspace(body: Body) { return await this.createElement('workspace', body); }
	async deleteWorkspace(id: string) { return await this.changeElement('workspace', id, 'DELETE'); }
	// Component API
	async getAllComponents() { return await this.request("component"); }
	async getComponentById(id: string) { return await this.request('component/' + id); }
	async createComponent(body: Body) { return await this.createElement('component', body); }
	async updateComponent(id: string, body: Body) { return await this.changeElement('component', id, 'PATCH', body); }
	async replaceComponent(id: string, body: Body) { return await this.changeElement('component', id, 'POST', body); }
	async deleteComponent(id: string) { return await this.changeElement('component', id, 'DELETE'); }
	async searchComponentByName(wsId: string, name:string) {
		return await this.request("component", { method: 'GET' }, { name : name });
	}
	async searchComponentByField(wsId  :string, field: { field: string; value: string; }) {
		return await this.request("component", { method: 'GET' }, field);
	}
	// Reference API
	async getAllReferences() { return await this.request("reference"); }
	async getReferenceById(id: string) { return await this.request('reference/' + id); }
	async createReference(body: Body) { return await this.createElement('reference', body); }
	async updateReference(id: string, body: Body) { return await this.changeElement('reference', id, 'PATCH', body); }
	async replaceReference(id: string, body: Body) { return await this.changeElement('reference', id, 'POST', body); }
	async deleteReference(id: string, body: Body) { return await this.changeElement('reference', id, 'DELETE'); }
	// This endpoints lets you search for a reference in a workspace when you know the value of a specific field
	async searchReferenceByField(wsId  :string, field : { field: string; value: string; }) {
		return await this.request("reference", { method: 'GET' }, field);
	}
	// Generic API
	async getAllElements(type: ManagedElement) { return await this.request(type); }
	async getElementById(type: ManagedElement, id: string) { return await this.request(type + '/' + id); }
	async createElement(type: ManagedElement, body: Body) { 
		return await this.request(type, { method: 'POST', body: JSON.stringify(body) });
	}
	async changeElement(type: ManagedElement, id: string, method: 'PATCH' | 'POST' | 'DELETE', body?: Body) {
		if (body) 
			return await this.request(type+'/'+id, { method: method, body: JSON.stringify(body) });
		else
			return await this.request(type+'/'+id, { method: method });
		}
	async updateElement(type: ManagedElement, id: string, body: Body) { return await this.changeElement(type, id, 'PATCH', body); }
	async replaceElement(type: ManagedElement, id: string, body: Body) { return await this.changeElement(type, id, 'POST', body); }
	async deleteElement(type: ManagedElement, id: string, body: Body) { return await this.changeElement(type, id, 'DELETE'); }

}