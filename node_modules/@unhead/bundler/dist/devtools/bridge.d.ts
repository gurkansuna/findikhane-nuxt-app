declare global {
    interface Window {
        __unhead__?: {
            _head?: any;
            _q?: any[];
            push?: (e: any) => void;
        };
        __unhead_devtools__?: any;
    }
}
