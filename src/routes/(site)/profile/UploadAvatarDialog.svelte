<script lang="ts">
    let dialog: HTMLDialogElement;
    let uploadAvatarForm: HTMLFormElement;
    let fileInput: HTMLInputElement;
    let avatarDataUrl: string | null | undefined;
    let dragover: boolean = false;
    let message: string | undefined;

    export function showModal() {
        dialog.showModal();
    }

    function fileSelected(file: File | undefined) {
        if (file) {
            if (!["image/jpeg", "image/png"].includes(file.type)) {
                message = "Тип файла аватара должен быть JPEG или PNG";
                avatarDataUrl = undefined;
                fileInput.files = null;
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                message = "Размер файла аватара не должен превышать 2 МБ";
                avatarDataUrl = undefined;
                fileInput.files = null;
                return;
            }
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = e => {
                avatarDataUrl = e.target?.result as typeof avatarDataUrl;
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fileInput.files = dataTransfer.files;
            }
        } else {
            avatarDataUrl = undefined;
            fileInput.files = null;
        }
    }

    function uploadAvatar() {
        if (avatarDataUrl) uploadAvatarForm.submit();
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<dialog bind:this={dialog} on:click|self={() => dialog.close()}>
    <div on:click|stopPropagation>
        {#if message}
        <div class="error-message">
            {message}
        </div>
        {/if}
        <center>
            <div class="avatar" class:placeholder={!avatarDataUrl || dragover} class:dragover
                    on:click={ () => { fileInput.click() } }
                    on:dragenter={ (e) => { e.preventDefault(); dragover = true; } }
                    on:dragleave={ () => { dragover = false; } }
                    on:dragover={ (e) => e.preventDefault() }
                    on:drop={ (e) => { e.preventDefault(); dragover = false; fileSelected(e.dataTransfer ? e.dataTransfer.files[0] : undefined) } }>
                {#if avatarDataUrl && !dragover}
                <img src={avatarDataUrl} alt="аватар" />
                {:else}
                кликните здесь для выбора изображения
                <br/>
                или
                <br/>
                просто перетащите его сюда мышью
                {/if}
            </div>

            В качестве аватара можно использовать изображения в формате PNG или JPEG. Размер файла не должен превышать 2 МБ.

            {#if avatarDataUrl}
            <div class="submit-container">
                <!-- svelte-ignore a11y-invalid-attribute -->
                <a href="javascript:" on:click={uploadAvatar} class="branded submit">ЗАГРУЗИТЬ</a>
            </div>
            {/if}
        </center>

        <form method="post" action="?/uploadAvatar" enctype="multipart/form-data" bind:this={uploadAvatarForm}>
            <input type="file" accept=".jpg, .jpeg, .png" name="avatar"
                bind:this={fileInput}
                on:change={ (e) => fileSelected(e.currentTarget.files ? e.currentTarget.files[0] : undefined) } />
        </form>
    </div>
</dialog>

<style lang="less">
    @import "/src/vars.less";

    dialog {
        width: 500px;
        background: @background-color;
        border: double 4px @border-color;
        outline: none;
        padding: 40px;
        color: #f0f0f0;

        &::backdrop {
            background: rgba(0, 0, 0, 0.7);
        }
    }

    .error-message {
        margin-bottom: 40px;
    }

    .avatar {
        width: 200px;
        height: 200px;
        margin-bottom: 40px;
        border: dashed 10px #0000;
        cursor: pointer;

        img {
            width: 100%;
            height: 100%;
        }
    }

    .placeholder {
        display: flex;
        align-items: center;
        border: dashed 10px #7c7c7c;
        color: #7c7c7c;
        border-radius: 20%;
        line-height: 1.5em;

        &.dragover {
            border: dashed 10px #969696;
            color: #969696;
        }
    }

    .submit-container {
        margin-top: 40px;
    }

    .submit {
        outline: none;
        font-size: 20pt;
        font-weight: 800;
    }

    form {
        display: none;
    }
</style>
