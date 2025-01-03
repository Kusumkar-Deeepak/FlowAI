import { WebContainer } from '@webcontainer/api';

let WebContainerInstance = null;

export const getWebContainer = () => {
  if(WebContainerInstance === null){
    WebContainerInstance = new WebContainer();
  }
  return WebContainerInstance;
}