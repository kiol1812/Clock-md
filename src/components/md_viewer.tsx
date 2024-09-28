import styles from './md.module.css'

export function Viewer({
    children,
    w
}:{
    children: React.ReactNode,
    w:number
}){
    return (
        <div className={styles.container} style={{width:`${w}px`}}>{children}</div>
    );
}