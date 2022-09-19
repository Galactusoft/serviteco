export class Organigrama {
    positionName: string;
    id: string;
    parentId: string;
    tags: string;
    name: string;
    area: string;
    imageUrl: string;
    isLoggedUser: boolean;
    color: string;

    /**
     * Constructor
     *
     * @param organigrama
     */
    constructor(organigrama?) {
        {
            this.id = organigrama?.id || null;
        }
    }
}