import styles from './md.module.css'

export function Editor({
    children
}:{
    children: React.ReactNode;
}){
    return (
        <div className={styles.container}>{children}</div>
    );
}