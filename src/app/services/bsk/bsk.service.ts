import { Injectable } from '@angular/core';
import { AtpSessionData, AtpSessionEvent, BskyAgent } from '@atproto/api';
import { ThreadViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
const DEFAULT_SERVICE = 'https://bsky.social';

@Injectable({
  providedIn: 'root',
})
export class BskService {
  public agent: BskyAgent | null = null;
  public handle: string | null = null;

  constructor() {
    this.restoreSavedSession();
    console.log(this.handle)
  }
  async restoreSavedSession(): Promise<BskyAgent | null> {
    try {
      const data = localStorage.getItem('bsky-session');
      if (data) {
        const { service, session } = JSON.parse(data);
        this.agent = this.createAgent(service);
        this.handle = session.handle;

        const response = await this.agent.resumeSession(session);
        if (response.success) {
          return this.agent;
        }
      }
    } catch (error) {
      console.error(error);
    }

    return null;
  }

  async login({
    handle,
    password,
    service,
  }: {
    handle: string;
    password: string;
    service: string;
  }) {
    try {
      this.agent = this.createAgent(service);
      const res = await this.agent.login({ identifier: handle, password });
      if (res.success) {
        this.handle = handle;
        return this.agent;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  }
  async logout(){
    // await this.agent.
  }
  createAgent(service?: string) {
    return new BskyAgent({
      service: service || DEFAULT_SERVICE,
      persistSession: (event: AtpSessionEvent, session?: AtpSessionData) => {
        if (session) {
          localStorage.setItem(
            'bsky-session',
            JSON.stringify({ service, session })
          );
        }
      },
    });
  }

  async getTimeLine() {
    const res = await this.agent?.getTimeline();
    return res?.data.feed;
  }
}
